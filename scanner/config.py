"""
COM9 Scanner — Référentiel prix & coûts réparation
Maintenu à jour manuellement selon le marché Vinted/Back Market.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class RepairCosts:
    screen: float        # Écran OLED/LCD
    battery: float       # Batterie
    back_glass: float    # Vitre arrière
    misc: float = 5.0    # Visserie, joint, pince (forfait)

    @property
    def total(self) -> float:
        return self.screen + self.battery + self.back_glass + self.misc


@dataclass
class MarketPrice:
    fast_sale: float      # Revente rapide (<48h) — prix bas du marché
    average: float        # Prix moyen Vinted/Back Market
    high: float           # Prix bon état, débloqué, boîte
    buy_max: float        # Seuil d'achat max absolu (au-delà = stop)


@dataclass
class ModelConfig:
    name: str
    market: MarketPrice
    repair: RepairCosts
    aliases: list[str] = field(default_factory=list)
    discord_channel: Optional[str] = None  # nom du salon Discord


# ─── Référentiel par modèle ──────────────────────────────────────────────────

MODELS: dict[str, ModelConfig] = {

    # ── iPhone X ──────────────────────────────────────────────────────────────
    "iphone_x": ModelConfig(
        name="iPhone X",
        aliases=["iphone x", "iphonex", "iphone10", "iphone 10"],
        market=MarketPrice(fast_sale=80, average=110, high=140, buy_max=70),
        repair=RepairCosts(screen=25, battery=10, back_glass=15),
        discord_channel="📱︱iphone-x",
    ),

    # ── iPhone XR ─────────────────────────────────────────────────────────────
    "iphone_xr": ModelConfig(
        name="iPhone XR",
        aliases=["iphone xr", "iphonexr"],
        market=MarketPrice(fast_sale=90, average=125, high=160, buy_max=80),
        repair=RepairCosts(screen=22, battery=10, back_glass=12),
        discord_channel="📱︱iphone-xr",
    ),

    # ── iPhone XS ─────────────────────────────────────────────────────────────
    "iphone_xs": ModelConfig(
        name="iPhone XS",
        aliases=["iphone xs", "iphonexs"],
        market=MarketPrice(fast_sale=100, average=135, high=170, buy_max=90),
        repair=RepairCosts(screen=28, battery=10, back_glass=18),
        discord_channel="📱︱iphone-xs",
    ),

    # ── iPhone XS Max ─────────────────────────────────────────────────────────
    "iphone_xs_max": ModelConfig(
        name="iPhone XS Max",
        aliases=["iphone xs max", "xs max", "iphonexsmax"],
        market=MarketPrice(fast_sale=110, average=150, high=190, buy_max=100),
        repair=RepairCosts(screen=32, battery=10, back_glass=20),
        discord_channel="📱︱iphone-xs-max",
    ),

    # ── iPhone 11 ─────────────────────────────────────────────────────────────
    "iphone_11": ModelConfig(
        name="iPhone 11",
        aliases=["iphone 11", "iphone11"],
        market=MarketPrice(fast_sale=120, average=165, high=210, buy_max=110),
        repair=RepairCosts(screen=22, battery=12, back_glass=15),
        discord_channel="📱︱iphone-11",
    ),

    # ── iPhone 11 Pro ─────────────────────────────────────────────────────────
    "iphone_11_pro": ModelConfig(
        name="iPhone 11 Pro",
        aliases=["iphone 11 pro", "11 pro", "iphone11pro"],
        market=MarketPrice(fast_sale=150, average=200, high=250, buy_max=135),
        repair=RepairCosts(screen=35, battery=12, back_glass=22),
        discord_channel="📱︱iphone-11-pro",
    ),

    # ── iPhone 11 Pro Max ─────────────────────────────────────────────────────
    "iphone_11_pro_max": ModelConfig(
        name="iPhone 11 Pro Max",
        aliases=["iphone 11 pro max", "11 pro max", "iphone11promax"],
        market=MarketPrice(fast_sale=170, average=225, high=280, buy_max=155),
        repair=RepairCosts(screen=40, battery=12, back_glass=25),
        discord_channel="📱︱iphone-11-pro-max",
    ),

    # ── iPhone 12 Mini ────────────────────────────────────────────────────────
    "iphone_12_mini": ModelConfig(
        name="iPhone 12 Mini",
        aliases=["iphone 12 mini", "12 mini", "iphone12mini"],
        market=MarketPrice(fast_sale=130, average=175, high=220, buy_max=115),
        repair=RepairCosts(screen=30, battery=12, back_glass=18),
        discord_channel="📱︱iphone-12",
    ),

    # ── iPhone 12 ─────────────────────────────────────────────────────────────
    "iphone_12": ModelConfig(
        name="iPhone 12",
        aliases=["iphone 12", "iphone12"],
        market=MarketPrice(fast_sale=145, average=195, high=245, buy_max=130),
        repair=RepairCosts(screen=30, battery=12, back_glass=18),
        discord_channel="📱︱iphone-12",
    ),

    # ── iPhone 12 Pro ─────────────────────────────────────────────────────────
    "iphone_12_pro": ModelConfig(
        name="iPhone 12 Pro",
        aliases=["iphone 12 pro", "12 pro", "iphone12pro"],
        market=MarketPrice(fast_sale=175, average=230, high=285, buy_max=160),
        repair=RepairCosts(screen=35, battery=12, back_glass=22),
        discord_channel="📱︱iphone-12-pro",
    ),

    # ── iPhone 12 Pro Max ─────────────────────────────────────────────────────
    "iphone_12_pro_max": ModelConfig(
        name="iPhone 12 Pro Max",
        aliases=["iphone 12 pro max", "12 pro max", "iphone12promax"],
        market=MarketPrice(fast_sale=190, average=250, high=310, buy_max=175),
        repair=RepairCosts(screen=40, battery=12, back_glass=25),
        discord_channel="📱︱iphone-12-pro-max",
    ),

    # ── iPhone 13 Mini ────────────────────────────────────────────────────────
    "iphone_13_mini": ModelConfig(
        name="iPhone 13 Mini",
        aliases=["iphone 13 mini", "13 mini", "iphone13mini"],
        market=MarketPrice(fast_sale=200, average=265, high=330, buy_max=180),
        repair=RepairCosts(screen=35, battery=14, back_glass=20),
        discord_channel="📱︱iphone-13",
    ),

    # ── iPhone 13 ─────────────────────────────────────────────────────────────
    "iphone_13": ModelConfig(
        name="iPhone 13",
        aliases=["iphone 13", "iphone13"],
        market=MarketPrice(fast_sale=230, average=300, high=370, buy_max=210),
        repair=RepairCosts(screen=35, battery=14, back_glass=20),
        discord_channel="📱︱iphone-13",
    ),

    # ── iPhone 13 Pro ─────────────────────────────────────────────────────────
    "iphone_13_pro": ModelConfig(
        name="iPhone 13 Pro",
        aliases=["iphone 13 pro", "13 pro", "iphone13pro"],
        market=MarketPrice(fast_sale=290, average=375, high=460, buy_max=265),
        repair=RepairCosts(screen=45, battery=14, back_glass=28),
        discord_channel="📱︱iphone-13-pro",
    ),

    # ── iPhone 13 Pro Max ─────────────────────────────────────────────────────
    "iphone_13_pro_max": ModelConfig(
        name="iPhone 13 Pro Max",
        aliases=["iphone 13 pro max", "13 pro max", "iphone13promax"],
        market=MarketPrice(fast_sale=320, average=415, high=510, buy_max=295),
        repair=RepairCosts(screen=50, battery=14, back_glass=30),
        discord_channel="📱︱iphone-13-pro-max",
    ),

    # ── iPhone 14 ─────────────────────────────────────────────────────────────
    "iphone_14": ModelConfig(
        name="iPhone 14",
        aliases=["iphone 14", "iphone14"],
        market=MarketPrice(fast_sale=320, average=410, high=500, buy_max=295),
        repair=RepairCosts(screen=40, battery=16, back_glass=25),
        discord_channel="📱︱iphone-14",
    ),

    # ── iPhone 14 Plus ────────────────────────────────────────────────────────
    "iphone_14_plus": ModelConfig(
        name="iPhone 14 Plus",
        aliases=["iphone 14 plus", "14 plus", "iphone14plus"],
        market=MarketPrice(fast_sale=340, average=435, high=530, buy_max=315),
        repair=RepairCosts(screen=45, battery=16, back_glass=28),
        discord_channel="📱︱iphone-14",
    ),

    # ── iPhone 14 Pro ─────────────────────────────────────────────────────────
    "iphone_14_pro": ModelConfig(
        name="iPhone 14 Pro",
        aliases=["iphone 14 pro", "14 pro", "iphone14pro"],
        market=MarketPrice(fast_sale=420, average=540, high=660, buy_max=385),
        repair=RepairCosts(screen=55, battery=16, back_glass=35),
        discord_channel="📱︱iphone-14-pro",
    ),

    # ── iPhone 14 Pro Max ─────────────────────────────────────────────────────
    "iphone_14_pro_max": ModelConfig(
        name="iPhone 14 Pro Max",
        aliases=["iphone 14 pro max", "14 pro max", "iphone14promax"],
        market=MarketPrice(fast_sale=460, average=590, high=720, buy_max=425),
        repair=RepairCosts(screen=60, battery=16, back_glass=38),
        discord_channel="📱︱iphone-14-pro-max",
    ),

    # ── iPhone 15 ─────────────────────────────────────────────────────────────
    "iphone_15": ModelConfig(
        name="iPhone 15",
        aliases=["iphone 15", "iphone15"],
        market=MarketPrice(fast_sale=520, average=660, high=800, buy_max=480),
        repair=RepairCosts(screen=45, battery=18, back_glass=28),
        discord_channel="📱︱iphone-15",
    ),

    # ── iPhone 15 Plus ────────────────────────────────────────────────────────
    "iphone_15_plus": ModelConfig(
        name="iPhone 15 Plus",
        aliases=["iphone 15 plus", "15 plus", "iphone15plus"],
        market=MarketPrice(fast_sale=560, average=710, high=860, buy_max=515),
        repair=RepairCosts(screen=50, battery=18, back_glass=30),
        discord_channel="📱︱iphone-15",
    ),

    # ── iPhone 15 Pro ─────────────────────────────────────────────────────────
    "iphone_15_pro": ModelConfig(
        name="iPhone 15 Pro",
        aliases=["iphone 15 pro", "15 pro", "iphone15pro"],
        market=MarketPrice(fast_sale=680, average=860, high=1040, buy_max=625),
        repair=RepairCosts(screen=60, battery=18, back_glass=40),
        discord_channel="📱︱iphone-15-pro",
    ),

    # ── iPhone 15 Pro Max ─────────────────────────────────────────────────────
    "iphone_15_pro_max": ModelConfig(
        name="iPhone 15 Pro Max",
        aliases=["iphone 15 pro max", "15 pro max", "iphone15promax"],
        market=MarketPrice(fast_sale=760, average=960, high=1160, buy_max=700),
        repair=RepairCosts(screen=65, battery=18, back_glass=42),
        discord_channel="📱︱iphone-15-pro-max",
    ),

    # ── iPhone 16 ─────────────────────────────────────────────────────────────
    "iphone_16": ModelConfig(
        name="iPhone 16",
        aliases=["iphone 16", "iphone16"],
        market=MarketPrice(fast_sale=620, average=780, high=940, buy_max=570),
        repair=RepairCosts(screen=50, battery=20, back_glass=30),
        discord_channel="📱︱iphone-16",
    ),

    # ── iPhone 16 Plus ────────────────────────────────────────────────────────
    "iphone_16_plus": ModelConfig(
        name="iPhone 16 Plus",
        aliases=["iphone 16 plus", "16 plus", "iphone16plus"],
        market=MarketPrice(fast_sale=670, average=840, high=1010, buy_max=615),
        repair=RepairCosts(screen=55, battery=20, back_glass=32),
        discord_channel="📱︱iphone-16",
    ),

    # ── iPhone 16 Pro ─────────────────────────────────────────────────────────
    "iphone_16_pro": ModelConfig(
        name="iPhone 16 Pro",
        aliases=["iphone 16 pro", "16 pro", "iphone16pro"],
        market=MarketPrice(fast_sale=800, average=1010, high=1220, buy_max=740),
        repair=RepairCosts(screen=65, battery=20, back_glass=42),
        discord_channel="📱︱iphone-16-pro",
    ),

    # ── iPhone 16 Pro Max ─────────────────────────────────────────────────────
    "iphone_16_pro_max": ModelConfig(
        name="iPhone 16 Pro Max",
        aliases=["iphone 16 pro max", "16 pro max", "iphone16promax"],
        market=MarketPrice(fast_sale=900, average=1130, high=1360, buy_max=830),
        repair=RepairCosts(screen=70, battery=20, back_glass=45),
        discord_channel="📱︱iphone-16-pro-max",
    ),
}


# ─── Blacklist mots-clés ─────────────────────────────────────────────────────

BLACKLIST_KEYWORDS: list[str] = [
    "icloud",
    "icloud lock",
    "verrouillé icloud",
    "mot de passe oublié",
    "mdp oublié",
    "bloqué",
    "bloque",
    "face id hs",
    "face id ne fonctionne",
    "touch id hs",
    "pour pièces",
    "pour piece",
    "pour pieces",
    "cassé",
    "casse",
    "hors service",
    "ne s'allume pas",
    "ne s allume pas",
    "ne démarre pas",
    "ne demarre pas",
    "liquid damage",
    "oxydé",
    "oxyde",
    "eau",
    "noyé",
    "noye",
    "compte apple",
    "compte activé",
    "samsung",  # erreur de catégorie parfois
]

# Seuil minimum de profit net pour déclencher une alerte
MIN_NET_PROFIT: float = 30.0

# Délai entre deux scrapes (secondes)
SCRAPE_INTERVAL: int = 90

# Nombre maximum d'annonces par requête Vinted
VINTED_MAX_PER_REQUEST: int = 30
