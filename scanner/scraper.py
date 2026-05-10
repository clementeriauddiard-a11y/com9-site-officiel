"""
COM9 Scanner — Scraper Vinted
Utilise l'API non-officielle Vinted (même endpoint que le site web).
Gère les tokens CSRF, les cookies de session et la rotation d'User-Agent.
"""

import logging
import random
import re
import time
from datetime import datetime
from typing import Optional

import requests

from config import BLACKLIST_KEYWORDS, MODELS, ModelConfig
from models import VintedListing

logger = logging.getLogger(__name__)

# ─── User-Agents pool ────────────────────────────────────────────────────────

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

VINTED_BASE = "https://www.vinted.fr"
VINTED_API  = "https://www.vinted.fr/api/v2"


class VintedSession:
    """Session HTTP persistante avec gestion automatique des cookies Vinted."""

    def __init__(self) -> None:
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": random.choice(_USER_AGENTS),
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Accept": "application/json, text/plain, */*",
        })
        self._last_refresh = 0.0
        self._refresh_cookies()

    def _refresh_cookies(self) -> None:
        """Visite la page d'accueil pour obtenir les cookies de session."""
        try:
            resp = self._session.get(VINTED_BASE, timeout=15)
            resp.raise_for_status()
            self._last_refresh = time.time()
            logger.debug("Cookies Vinted rafraîchis.")
        except Exception as exc:
            logger.warning("Impossible de rafraîchir les cookies Vinted : %s", exc)

    def _maybe_refresh(self) -> None:
        # Rafraîchit les cookies toutes les 30 minutes
        if time.time() - self._last_refresh > 1800:
            self._refresh_cookies()
            self._session.headers["User-Agent"] = random.choice(_USER_AGENTS)

    def get(self, url: str, **kwargs) -> requests.Response:
        self._maybe_refresh()
        resp = self._session.get(url, timeout=20, **kwargs)
        if resp.status_code == 401:
            logger.info("Session expirée, rafraîchissement forcé.")
            self._refresh_cookies()
            resp = self._session.get(url, timeout=20, **kwargs)
        return resp


# ─── Détection de modèle ─────────────────────────────────────────────────────

def detect_model(text: str) -> Optional[str]:
    """Retourne la clé du modèle détecté dans le texte, ou None."""
    text_lower = text.lower()

    # Ordre important : du plus spécifique au moins spécifique
    priority_order = [
        "iphone_16_pro_max", "iphone_16_pro", "iphone_16_plus", "iphone_16",
        "iphone_15_pro_max", "iphone_15_pro", "iphone_15_plus", "iphone_15",
        "iphone_14_pro_max", "iphone_14_pro", "iphone_14_plus", "iphone_14",
        "iphone_13_pro_max", "iphone_13_pro", "iphone_13_mini", "iphone_13",
        "iphone_12_pro_max", "iphone_12_pro", "iphone_12_mini", "iphone_12",
        "iphone_11_pro_max", "iphone_11_pro", "iphone_11",
        "iphone_xs_max", "iphone_xs", "iphone_xr", "iphone_x",
    ]

    for key in priority_order:
        model = MODELS.get(key)
        if not model:
            continue
        for alias in model.aliases:
            if alias in text_lower:
                return key

    return None


# ─── Filtrage blacklist ───────────────────────────────────────────────────────

def has_blacklist_keyword(text: str) -> tuple[bool, str]:
    """Retourne (True, mot_trouvé) si le texte contient un mot blacklisté."""
    text_lower = text.lower()
    for kw in BLACKLIST_KEYWORDS:
        if kw in text_lower:
            return True, kw
    return False, ""


# ─── Parsing annonce Vinted ───────────────────────────────────────────────────

def _parse_listing(item: dict) -> Optional[VintedListing]:
    try:
        listing_id = str(item["id"])
        title      = item.get("title", "")
        price      = float(item.get("price", 0))
        url        = item.get("url", f"{VINTED_BASE}/items/{listing_id}")
        if not url.startswith("http"):
            url = f"{VINTED_BASE}{url}"

        # Image principale
        photos = item.get("photos", [])
        image_url = photos[0].get("url") if photos else None

        # Vendeur
        user = item.get("user", {})
        seller_name  = user.get("login", "inconnu")
        seller_items = int(user.get("items_count", 0))
        feedback     = user.get("feedback_reputation")
        seller_rating = float(feedback) if feedback is not None else None

        condition    = item.get("status", "")
        description  = item.get("description", "")

        raw_date = item.get("created_at_ts") or item.get("created_at", "")
        if isinstance(raw_date, (int, float)):
            published_at = datetime.utcfromtimestamp(raw_date)
        else:
            try:
                published_at = datetime.fromisoformat(str(raw_date).replace("Z", "+00:00"))
            except Exception:
                published_at = datetime.utcnow()

        return VintedListing(
            id=listing_id,
            title=title,
            price=price,
            url=url,
            image_url=image_url,
            seller_name=seller_name,
            seller_rating=seller_rating,
            seller_items_count=seller_items,
            condition=condition,
            description=description,
            published_at=published_at,
        )
    except Exception as exc:
        logger.debug("Erreur parsing annonce : %s", exc)
        return None


# ─── Scrape principal ─────────────────────────────────────────────────────────

def scrape_model(
    session: VintedSession,
    model_key: str,
    per_page: int = 30,
) -> list[VintedListing]:
    """
    Scrape les annonces Vinted pour un modèle donné.
    Retourne la liste des annonces filtrées (blacklist exclue).
    """
    model: ModelConfig = MODELS[model_key]
    # Utilise le premier alias comme terme de recherche principal
    search_term = model.aliases[0]

    params = {
        "search_text":    search_term,
        "catalog_ids":    "",           # 0 = toutes catégories
        "currency":       "EUR",
        "price_from":     1,
        "price_to":       int(model.market.buy_max * 1.2),  # marge de sécurité
        "order":          "newest_first",
        "per_page":       per_page,
        "page":           1,
    }

    try:
        resp = session.get(f"{VINTED_API}/items", params=params)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.error("Erreur scrape %s : %s", model_key, exc)
        return []

    raw_items = data.get("items", [])
    listings: list[VintedListing] = []

    for item in raw_items:
        listing = _parse_listing(item)
        if listing is None:
            continue

        # ── Filtre prix trop élevé ────────────────────────────────────────
        if listing.price > model.market.buy_max * 1.1:
            continue

        # ── Filtre blacklist ──────────────────────────────────────────────
        full_text = f"{listing.title} {listing.description}"
        blocked, kw = has_blacklist_keyword(full_text)
        if blocked:
            logger.debug("Blacklist '%s' → %s (%.0f€)", kw, listing.title, listing.price)
            continue

        # ── Vérif modèle détecté cohérent ────────────────────────────────
        detected = detect_model(listing.title)
        if detected is None:
            detected = detect_model(listing.description)
        if detected != model_key:
            # Annonce mal catégorisée ou mauvais modèle
            continue

        listings.append(listing)

    logger.info("Scrape %s → %d annonces filtrées", model.name, len(listings))
    return listings


def scrape_all(session: VintedSession, per_page: int = 30) -> dict[str, list[VintedListing]]:
    """Scrape tous les modèles configurés."""
    results: dict[str, list[VintedListing]] = {}
    for model_key in MODELS:
        results[model_key] = scrape_model(session, model_key, per_page)
        # Pause courte entre requêtes pour ne pas se faire rate-limit
        time.sleep(random.uniform(1.5, 3.0))
    return results
