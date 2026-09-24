"""
COM9 Scanner — Moteur d'analyse de rentabilité
Logique propre au réparateur : coûts réels, profit net, scoring intelligent.
"""

import logging
import re
from typing import Optional

from config import MIN_NET_PROFIT, MODELS, ModelConfig
from models import (
    ProfitAnalysis,
    RepairEstimate,
    ScoreLevel,
    SCORE_DISPLAY,
    VintedListing,
)

logger = logging.getLogger(__name__)

# ─── Mots signalant un écran cassé / HS ─────────────────────────────────────

_SCREEN_DAMAGE_KW = [
    "écran cassé", "ecran cassé", "ecran casse", "écran hs", "ecran hs",
    "vitre cassée", "vitre cassee", "vitre fissurée", "vitre fissuree",
    "fissure", "fissures", "rayures", "rayé", "raye",
    "lcd", "taches", "pixels morts", "dead pixels",
    "écran abîmé", "ecran abime",
]

_BATTERY_DAMAGE_KW = [
    "batterie faible", "autonomie réduite", "autonomie reduite",
    "batterie à changer", "batterie a changer", "batterie hs",
    "autonomie courte", "charge lente",
    "80%", "79%", "78%", "77%", "76%", "75%",  # pourcentage batterie bas
]

_BACK_GLASS_KW = [
    "dos cassé", "dos casse", "vitre arrière cassée", "vitre arriere cassee",
    "vitre arrière fissurée", "vitre arriere fissuree",
    "dos fissuré", "dos fissure",
]


def _infer_repair_needs(listing: VintedListing, model_cfg: ModelConfig) -> RepairEstimate:
    """
    Déduit les réparations nécessaires depuis le titre + description + état.
    Logique : si le titre/description mentionne un problème, on l'inclut dans l'estimation.
    """
    text = f"{listing.title} {listing.description} {listing.condition}".lower()
    repair = RepairEstimate()

    # ── Condition générale ────────────────────────────────────────────────────
    condition_lower = listing.condition.lower()
    is_bad_condition = any(w in condition_lower for w in [
        "mauvais", "pour pièces", "défaut", "cassé", "hs", "abîmé"
    ])

    # ── Écran ─────────────────────────────────────────────────────────────────
    if any(kw in text for kw in _SCREEN_DAMAGE_KW) or is_bad_condition:
        repair.needs_screen = True
        repair.screen_cost = model_cfg.repair.screen
        repair.reasoning.append(f"Écran endommagé estimé : {model_cfg.repair.screen:.0f}€")

    # ── Batterie ──────────────────────────────────────────────────────────────
    battery_mentioned = any(kw in text for kw in _BATTERY_DAMAGE_KW)
    # Détecte pourcentage batterie affiché dans le texte (ex: "batterie 74%")
    battery_pct_match = re.search(r'batterie[^\d]*(\d{2,3})\s*%', text)
    if battery_pct_match:
        pct = int(battery_pct_match.group(1))
        if pct < 82:
            battery_mentioned = True
            repair.reasoning.append(f"Batterie {pct}% détectée")

    if battery_mentioned or listing.condition.lower() in ("mauvais état", "pour pièces"):
        repair.needs_battery = True
        repair.battery_cost = model_cfg.repair.battery
        repair.reasoning.append(f"Batterie à remplacer : {model_cfg.repair.battery:.0f}€")

    # ── Vitre arrière ─────────────────────────────────────────────────────────
    if any(kw in text for kw in _BACK_GLASS_KW):
        repair.needs_back_glass = True
        repair.back_glass_cost = model_cfg.repair.back_glass
        repair.reasoning.append(f"Vitre arrière : {model_cfg.repair.back_glass:.0f}€")

    # Toujours compter les misc (visserie, nettoyage)
    repair.misc_cost = model_cfg.repair.misc

    return repair


def _compute_score(
    net_profit_fast: float,
    roi: float,
    risk_flags: list[str],
    buy_price: float,
    model_cfg: ModelConfig,
) -> ScoreLevel:
    """Logique de scoring en 5 niveaux."""

    # Bloquants absolus
    if buy_price > model_cfg.market.buy_max:
        return ScoreLevel.SKIP
    if net_profit_fast < 0:
        return ScoreLevel.SKIP
    if len(risk_flags) >= 3:
        return ScoreLevel.RISKY

    # Scoring positif
    if net_profit_fast >= 120 and roi >= 35 and not risk_flags:
        return ScoreLevel.EXCELLENT
    if net_profit_fast >= 70 and roi >= 20:
        return ScoreLevel.GOOD if not risk_flags else ScoreLevel.AVERAGE
    if net_profit_fast >= MIN_NET_PROFIT:
        return ScoreLevel.AVERAGE if not risk_flags else ScoreLevel.RISKY

    return ScoreLevel.RISKY


def _collect_risk_flags(listing: VintedListing, model_cfg: ModelConfig) -> list[str]:
    flags = []
    text = f"{listing.title} {listing.description}".lower()

    if listing.seller_rating is not None and listing.seller_rating < 0.7:
        flags.append(f"Note vendeur faible ({listing.seller_rating:.0%})")

    if listing.seller_items_count < 3:
        flags.append("Vendeur peu actif (<3 ventes)")

    if listing.price < model_cfg.market.fast_sale * 0.3:
        flags.append("Prix anormalement bas — arnaque possible")

    if any(w in text for w in ["urgent", "besoin d'argent", "besoin argent"]):
        flags.append("Vendeur sous pression (bon signal ou arnaque)")

    if any(w in text for w in ["réplique", "copie", "fake", "clone"]):
        flags.append("Possible contrefaçon mentionnée")

    return flags


def analyze(listing: VintedListing, model_key: str) -> Optional[ProfitAnalysis]:
    """
    Analyse complète d'une annonce.
    Retourne None si l'annonce ne vaut pas la peine d'être alertée.
    """
    model_cfg = MODELS.get(model_key)
    if not model_cfg:
        return None

    buy_price = listing.price
    repair    = _infer_repair_needs(listing, model_cfg)
    total_cost = buy_price + repair.total

    resale_fast    = model_cfg.market.fast_sale
    resale_average = model_cfg.market.average

    net_profit_fast    = resale_fast - total_cost
    net_profit_average = resale_average - total_cost

    roi = (net_profit_fast / total_cost * 100) if total_cost > 0 else 0

    risk_flags = _collect_risk_flags(listing, model_cfg)
    score      = _compute_score(net_profit_fast, roi, risk_flags, buy_price, model_cfg)
    label, emoji = SCORE_DISPLAY[score]

    # N'alerte pas les annonces SKIP
    if score == ScoreLevel.SKIP:
        logger.debug("SKIP %s %.0f€ → profit %.0f€", listing.title, buy_price, net_profit_fast)
        return None

    return ProfitAnalysis(
        listing=listing,
        model_key=model_key,
        model_name=model_cfg.name,
        buy_price=buy_price,
        repair=repair,
        resale_fast=resale_fast,
        resale_average=resale_average,
        net_profit_fast=net_profit_fast,
        net_profit_average=net_profit_average,
        roi_percent=roi,
        score=score,
        score_label=label,
        score_emoji=emoji,
        risk_flags=risk_flags,
        discord_channel=model_cfg.discord_channel,
    )
