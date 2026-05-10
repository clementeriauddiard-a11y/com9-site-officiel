"""
COM9 Scanner — Modèles de données
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class ScoreLevel(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    RISKY = "risky"
    SKIP = "skip"


@dataclass
class VintedListing:
    """Annonce brute récupérée depuis Vinted."""
    id: str
    title: str
    price: float
    url: str
    image_url: Optional[str]
    seller_name: str
    seller_rating: Optional[float]
    seller_items_count: int
    condition: str          # "Très bon état", "Bon état", etc.
    description: str
    published_at: datetime
    location: Optional[str] = None


@dataclass
class RepairEstimate:
    """Estimation des coûts de réparation pour une annonce donnée."""
    needs_screen: bool = False
    needs_battery: bool = False
    needs_back_glass: bool = False
    screen_cost: float = 0.0
    battery_cost: float = 0.0
    back_glass_cost: float = 0.0
    misc_cost: float = 5.0
    reasoning: list[str] = field(default_factory=list)

    @property
    def total(self) -> float:
        return self.screen_cost + self.battery_cost + self.back_glass_cost + self.misc_cost


@dataclass
class ProfitAnalysis:
    """Analyse complète de rentabilité d'une annonce."""
    listing: VintedListing
    model_key: str
    model_name: str

    # Prix d'achat
    buy_price: float

    # Estimation réparation
    repair: RepairEstimate

    # Prix de revente estimé (scénario rapide)
    resale_fast: float
    resale_average: float

    # Profit net
    net_profit_fast: float      # revente rapide - achat - réparation
    net_profit_average: float   # revente moyenne - achat - réparation

    # ROI en %
    roi_percent: float

    # Score final
    score: ScoreLevel
    score_label: str
    score_emoji: str

    # Drapeaux de risque
    risk_flags: list[str] = field(default_factory=list)

    # Canaux Discord cibles
    discord_channel: Optional[str] = None


# ─── Helpers ────────────────────────────────────────────────────────────────

SCORE_DISPLAY = {
    ScoreLevel.EXCELLENT: ("🟢 ACHAT EXCELLENT", "🟢"),
    ScoreLevel.GOOD:      ("🟡 BON ACHAT",       "🟡"),
    ScoreLevel.AVERAGE:   ("🟠 MOYEN",            "🟠"),
    ScoreLevel.RISKY:     ("🔴 RISQUÉ",           "🔴"),
    ScoreLevel.SKIP:      ("⛔ PASSER",           "⛔"),
}

# Couleurs Discord embed par score (format int hex)
SCORE_COLOR = {
    ScoreLevel.EXCELLENT: 0x00FF88,   # vert électrique
    ScoreLevel.GOOD:      0xFFD700,   # or
    ScoreLevel.AVERAGE:   0xFF8C00,   # orange
    ScoreLevel.RISKY:     0xFF3333,   # rouge
    ScoreLevel.SKIP:      0x555555,   # gris
}
