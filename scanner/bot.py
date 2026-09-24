"""
COM9 Scanner — Discord Bot
Orchestre le scraping, l'analyse, et l'envoi des embeds dans les bons salons.
"""

import asyncio
import logging
import os
from typing import Optional

import discord
from discord.ext import commands, tasks

import analyzer
import database
from config import MODELS, SCRAPE_INTERVAL
from embeds import build_alert_embed, build_error_embed, build_summary_embed
from models import ProfitAnalysis, ScoreLevel
from scraper import VintedSession, scrape_model

logger = logging.getLogger(__name__)

# ─── Config env ──────────────────────────────────────────────────────────────

DISCORD_TOKEN     = os.environ["DISCORD_TOKEN"]
DISCORD_GUILD_ID  = int(os.environ["DISCORD_GUILD_ID"])

# Salon logs/résumés (ex: #📊-logs-scanner)
SUMMARY_CHANNEL_NAME = os.environ.get("SUMMARY_CHANNEL_NAME", "📊︱logs-scanner")

# Niveau minimum de score pour déclencher une alerte
# excellent, good, average, risky
MIN_SCORE_TO_ALERT = os.environ.get("MIN_SCORE_ALERT", "good")

_MIN_SCORE_MAP = {
    "excellent": {ScoreLevel.EXCELLENT},
    "good":      {ScoreLevel.EXCELLENT, ScoreLevel.GOOD},
    "average":   {ScoreLevel.EXCELLENT, ScoreLevel.GOOD, ScoreLevel.AVERAGE},
    "risky":     {ScoreLevel.EXCELLENT, ScoreLevel.GOOD, ScoreLevel.AVERAGE, ScoreLevel.RISKY},
}
ALERT_LEVELS = _MIN_SCORE_MAP.get(MIN_SCORE_TO_ALERT, _MIN_SCORE_MAP["good"])


# ─── Bot ─────────────────────────────────────────────────────────────────────

class COM9Bot(commands.Bot):

    def __init__(self) -> None:
        intents = discord.Intents.default()
        intents.guilds = True
        super().__init__(command_prefix="!", intents=intents)
        self.vinted_session = VintedSession()
        self._channel_cache: dict[str, Optional[discord.TextChannel]] = {}

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def setup_hook(self) -> None:
        database.init_db()
        self.scan_loop.start()
        logger.info("COM9 Scanner démarré.")

    async def on_ready(self) -> None:
        logger.info("Connecté en tant que %s (ID: %s)", self.user, self.user.id)
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="Vinted 👀",
            )
        )

    # ── Résolution de salon ───────────────────────────────────────────────────

    def _get_guild(self) -> Optional[discord.Guild]:
        return self.get_guild(DISCORD_GUILD_ID)

    async def _resolve_channel(self, channel_name: str) -> Optional[discord.TextChannel]:
        if channel_name in self._channel_cache:
            return self._channel_cache[channel_name]

        guild = self._get_guild()
        if not guild:
            return None

        # Cherche par nom exact (sans émojis) ou nom complet
        name_clean = channel_name.split("︱")[-1] if "︱" in channel_name else channel_name
        for ch in guild.text_channels:
            if ch.name == name_clean or ch.name == channel_name:
                self._channel_cache[channel_name] = ch
                return ch

        logger.warning("Salon introuvable : '%s'", channel_name)
        self._channel_cache[channel_name] = None
        return None

    # ── Envoi d'une alerte ────────────────────────────────────────────────────

    async def send_alert(self, analysis: ProfitAnalysis) -> bool:
        channel_name = analysis.discord_channel or SUMMARY_CHANNEL_NAME
        channel = await self._resolve_channel(channel_name)
        if not channel:
            # Fallback sur le canal résumé
            channel = await self._resolve_channel(SUMMARY_CHANNEL_NAME)
        if not channel:
            logger.error("Aucun canal disponible pour envoyer l'alerte.")
            return False

        embed = build_alert_embed(analysis)
        view  = _AlertButtons(analysis.listing.url)

        try:
            await channel.send(embed=embed, view=view)
            return True
        except discord.Forbidden:
            logger.error("Permission refusée pour écrire dans #%s", channel.name)
            return False
        except Exception as exc:
            logger.error("Erreur envoi alerte : %s", exc)
            return False

    # ── Boucle principale de scan ─────────────────────────────────────────────

    @tasks.loop(seconds=SCRAPE_INTERVAL)
    async def scan_loop(self) -> None:
        logger.info("Début du cycle de scan Vinted.")
        total_scanned = 0
        total_alerted = 0
        top_deals: list[ProfitAnalysis] = []

        for model_key in MODELS:
            try:
                listings = await asyncio.to_thread(
                    scrape_model,
                    self.vinted_session,
                    model_key,
                )
                total_scanned += len(listings)

                for listing in listings:
                    # Anti-doublon
                    if database.is_seen(listing.id):
                        continue
                    if database.is_seller_blacklisted(listing.seller_name):
                        logger.debug("Vendeur blacklisté : %s", listing.seller_name)
                        continue

                    # Analyse de rentabilité
                    analysis = analyzer.analyze(listing, model_key)

                    # Marque toujours comme vu (même si on n'alerte pas)
                    database.mark_seen(
                        listing_id=listing.id,
                        model_key=model_key,
                        price=listing.price,
                        net_profit=analysis.net_profit_fast if analysis else None,
                        score=analysis.score.value if analysis else "skip",
                        url=listing.url,
                    )

                    if analysis is None or analysis.score not in ALERT_LEVELS:
                        continue

                    # Envoi de l'alerte
                    sent = await self.send_alert(analysis)
                    if sent:
                        total_alerted += 1
                        top_deals.append(analysis)
                        logger.info(
                            "ALERTE %s — %s — %.0f€ → +%.0f€",
                            analysis.score_emoji,
                            analysis.model_name,
                            listing.price,
                            analysis.net_profit_fast,
                        )

            except Exception as exc:
                logger.error("Erreur cycle scan %s : %s", model_key, exc)

        # Résumé toutes les N itérations si activé
        if total_alerted > 0:
            await self._send_summary(total_scanned, total_alerted, top_deals)

        logger.info("Cycle terminé — %d scannées, %d alertes.", total_scanned, total_alerted)

        # Purge hebdomadaire des entrées anciennes
        database.purge_old_entries(days=30)

    @scan_loop.before_loop
    async def before_scan(self) -> None:
        await self.wait_until_ready()

    @scan_loop.error
    async def on_scan_error(self, error: Exception) -> None:
        logger.exception("Erreur dans la boucle de scan : %s", error)
        summary_ch = await self._resolve_channel(SUMMARY_CHANNEL_NAME)
        if summary_ch:
            await summary_ch.send(embed=build_error_embed(str(error)))

    async def _send_summary(
        self,
        total_scanned: int,
        total_alerted: int,
        top_deals: list[ProfitAnalysis],
    ) -> None:
        channel = await self._resolve_channel(SUMMARY_CHANNEL_NAME)
        if not channel:
            return
        top_sorted = sorted(top_deals, key=lambda a: a.net_profit_fast, reverse=True)
        embed = build_summary_embed(total_scanned, total_alerted, top_sorted)
        try:
            await channel.send(embed=embed)
        except Exception as exc:
            logger.error("Erreur envoi résumé : %s", exc)


# ─── Composants UI (boutons) ─────────────────────────────────────────────────

class _AlertButtons(discord.ui.View):
    def __init__(self, listing_url: str) -> None:
        super().__init__(timeout=None)
        self.add_item(
            discord.ui.Button(
                label="🛒  Voir sur Vinted",
                style=discord.ButtonStyle.link,
                url=listing_url,
            )
        )


# ─── Commandes slash ─────────────────────────────────────────────────────────

async def register_slash_commands(bot: COM9Bot) -> None:
    tree = bot.tree

    @tree.command(name="stats", description="Statistiques COM9 Scanner")
    async def cmd_stats(interaction: discord.Interaction) -> None:
        s = database.stats()
        embed = discord.Embed(
            title="📊  COM9 Scanner — Stats",
            color=0x00B4FF,
        )
        embed.add_field(name="Total vu", value=str(s["total_seen"]), inline=True)
        embed.add_field(name="Aujourd'hui", value=str(s["today"]),   inline=True)
        embed.add_field(name="Vendeurs BL", value=str(s["blacklisted_sellers"]), inline=True)
        await interaction.response.send_message(embed=embed, ephemeral=True)

    @tree.command(name="blacklist", description="Blackliste un vendeur Vinted")
    @discord.app_commands.describe(seller="Nom du vendeur Vinted", reason="Raison")
    async def cmd_blacklist(
        interaction: discord.Interaction,
        seller: str,
        reason: str = "",
    ) -> None:
        database.blacklist_seller(seller, reason)
        await interaction.response.send_message(
            f"✅  **{seller}** ajouté à la blacklist.", ephemeral=True
        )

    await bot.tree.sync(guild=discord.Object(id=DISCORD_GUILD_ID))
    logger.info("Commandes slash enregistrées.")
