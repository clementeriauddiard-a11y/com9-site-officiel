"""
COM9 Scanner — Base SQLite anti-doublons + historique alertes
"""

import sqlite3
import logging
from datetime import datetime, timedelta
from pathlib import Path

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent / "data" / "com9_scanner.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS seen_listings (
                id          TEXT PRIMARY KEY,
                model_key   TEXT NOT NULL,
                price       REAL NOT NULL,
                net_profit  REAL,
                score       TEXT,
                url         TEXT,
                alerted_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS blacklisted_sellers (
                seller_name TEXT PRIMARY KEY,
                reason      TEXT,
                added_at    TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_seen_alerted
                ON seen_listings(alerted_at);
        """)
    logger.info("Base de données initialisée : %s", DB_PATH)


def is_seen(listing_id: str) -> bool:
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM seen_listings WHERE id = ?", (listing_id,)
        ).fetchone()
    return row is not None


def mark_seen(
    listing_id: str,
    model_key: str,
    price: float,
    net_profit: float | None = None,
    score: str | None = None,
    url: str | None = None,
) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO seen_listings
                (id, model_key, price, net_profit, score, url, alerted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (listing_id, model_key, price, net_profit, score, url,
             datetime.utcnow().isoformat()),
        )


def is_seller_blacklisted(seller_name: str) -> bool:
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM blacklisted_sellers WHERE seller_name = ?",
            (seller_name,),
        ).fetchone()
    return row is not None


def blacklist_seller(seller_name: str, reason: str = "") -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO blacklisted_sellers (seller_name, reason, added_at)
            VALUES (?, ?, ?)
            """,
            (seller_name, reason, datetime.utcnow().isoformat()),
        )
    logger.info("Vendeur blacklisté : %s (%s)", seller_name, reason)


def purge_old_entries(days: int = 30) -> int:
    """Supprime les entrées vues il y a plus de `days` jours."""
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM seen_listings WHERE alerted_at < ?", (cutoff,)
        )
    logger.info("Purge : %d entrées supprimées (> %d jours)", cursor.rowcount, days)
    return cursor.rowcount


def stats() -> dict:
    with _connect() as conn:
        total = conn.execute("SELECT COUNT(*) FROM seen_listings").fetchone()[0]
        today = conn.execute(
            "SELECT COUNT(*) FROM seen_listings WHERE alerted_at >= ?",
            (datetime.utcnow().date().isoformat(),),
        ).fetchone()[0]
        blacklisted = conn.execute(
            "SELECT COUNT(*) FROM blacklisted_sellers"
        ).fetchone()[0]
    return {"total_seen": total, "today": today, "blacklisted_sellers": blacklisted}
