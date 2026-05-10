"""
COM9 Scanner — Constructeur d'embeds Discord
Style : futuriste, bleu électrique, identité Com'9.
"""

from datetime import datetime

import discord

from models import ProfitAnalysis, ScoreLevel, SCORE_COLOR

# Couleur principale Com'9 (bleu électrique)
COM9_BLUE   = 0x00B4FF
COM9_ACCENT = 0x0066FF

# URL logo Com'9 (utilisé comme thumbnail dans les embeds)
COM9_LOGO_URL = "https://com9.fr/logo.png"  # remplacer par URL réelle


def build_alert_embed(analysis: ProfitAnalysis) -> discord.Embed:
    """Embed principal d'alerte — affiché dans le salon du modèle."""

    listing = analysis.listing
    color   = SCORE_COLOR[analysis.score]

    embed = discord.Embed(
        title=f"{analysis.score_emoji}  {listing.title}",
        url=listing.url,
        color=color,
        timestamp=datetime.utcnow(),
    )

    # ── Thumbnail image produit ───────────────────────────────────────────────
    if listing.image_url:
        embed.set_thumbnail(url=listing.image_url)

    # ── Auteur ────────────────────────────────────────────────────────────────
    embed.set_author(
        name="COM9 Scanner  •  Alerte Vinted",
        icon_url=COM9_LOGO_URL,
    )

    # ── Ligne 1 : Prix & Modèle ───────────────────────────────────────────────
    embed.add_field(
        name="📱  Modèle",
        value=f"**{analysis.model_name}**",
        inline=True,
    )
    embed.add_field(
        name="🏷️  Prix demandé",
        value=f"**{analysis.buy_price:.0f} €**",
        inline=True,
    )
    embed.add_field(
        name="📦  État",
        value=listing.condition or "Non précisé",
        inline=True,
    )

    # ── Séparateur visuel ─────────────────────────────────────────────────────
    embed.add_field(name="​", value="━━━━━━━━━━━━━━━━━━━━", inline=False)

    # ── Ligne 2 : Réparation ──────────────────────────────────────────────────
    repair = analysis.repair
    repair_lines = []
    if repair.needs_screen:
        repair_lines.append(f"  🖥️  Écran :        **{repair.screen_cost:.0f} €**")
    if repair.needs_battery:
        repair_lines.append(f"  🔋  Batterie :    **{repair.battery_cost:.0f} €**")
    if repair.needs_back_glass:
        repair_lines.append(f"  🔲  Vitre arr. :  **{repair.back_glass_cost:.0f} €**")
    repair_lines.append(f"  🔩  Divers :       **{repair.misc_cost:.0f} €**")
    repair_text = "\n".join(repair_lines) if repair_lines else "Aucune réparation prévue"

    embed.add_field(
        name="🔧  Réparation estimée",
        value=f"```\n{chr(10).join(repair_lines)}\n```\n**Total : {repair.total:.0f} €**",
        inline=True,
    )

    # ── Ligne 2 : Rentabilité ─────────────────────────────────────────────────
    profit_emoji_fast = "✅" if analysis.net_profit_fast >= 60 else ("⚠️" if analysis.net_profit_fast >= 30 else "❌")
    embed.add_field(
        name="💰  Rentabilité",
        value=(
            f"```\n"
            f"  Achat       : {analysis.buy_price:.0f} €\n"
            f"  Réparation  : {repair.total:.0f} €\n"
            f"  ─────────────────\n"
            f"  Coût total  : {analysis.buy_price + repair.total:.0f} €\n"
            f"  Revente 48h : {analysis.resale_fast:.0f} €\n"
            f"  Revente moy : {analysis.resale_average:.0f} €\n"
            f"```\n"
            f"{profit_emoji_fast} **Profit rapide : +{analysis.net_profit_fast:.0f} €**\n"
            f"📈 **ROI : {analysis.roi_percent:.0f}%**"
        ),
        inline=True,
    )

    # ── Séparateur ────────────────────────────────────────────────────────────
    embed.add_field(name="​", value="━━━━━━━━━━━━━━━━━━━━", inline=False)

    # ── Score ─────────────────────────────────────────────────────────────────
    embed.add_field(
        name="⚡  Score COM9",
        value=f"# {analysis.score_label}",
        inline=False,
    )

    # ── Flags de risque ───────────────────────────────────────────────────────
    if analysis.risk_flags:
        flags_text = "\n".join(f"⚠️  {f}" for f in analysis.risk_flags)
        embed.add_field(
            name="🚩  Points d'attention",
            value=flags_text,
            inline=False,
        )

    # ── Vendeur ───────────────────────────────────────────────────────────────
    rating_str = f"{listing.seller_rating:.0%}" if listing.seller_rating is not None else "N/A"
    embed.add_field(
        name="👤  Vendeur",
        value=(
            f"**{listing.seller_name}**\n"
            f"Note : {rating_str}  •  {listing.seller_items_count} ventes"
        ),
        inline=True,
    )

    # ── Horodatage annonce ────────────────────────────────────────────────────
    embed.add_field(
        name="🕐  Publiée",
        value=f"<t:{int(listing.published_at.timestamp())}:R>",
        inline=True,
    )

    # ── Footer ────────────────────────────────────────────────────────────────
    embed.set_footer(
        text="COM9 Scanner  •  Powered by Com'9 Repair",
        icon_url=COM9_LOGO_URL,
    )

    return embed


def build_summary_embed(
    total_scanned: int,
    total_alerted: int,
    top_deals: list[ProfitAnalysis],
) -> discord.Embed:
    """Embed de résumé du cycle de scan (affiché dans un salon #résumé)."""

    embed = discord.Embed(
        title="📊  Rapport COM9 Scanner",
        description=f"Cycle terminé — **{total_scanned}** annonces analysées",
        color=COM9_BLUE,
        timestamp=datetime.utcnow(),
    )
    embed.set_author(
        name="COM9 Scanner  •  Synthèse",
        icon_url=COM9_LOGO_URL,
    )

    embed.add_field(
        name="📡  Annonces scannées",
        value=f"**{total_scanned}**",
        inline=True,
    )
    embed.add_field(
        name="🔔  Alertes envoyées",
        value=f"**{total_alerted}**",
        inline=True,
    )
    embed.add_field(name="​", value="​", inline=True)

    if top_deals:
        lines = []
        for i, deal in enumerate(top_deals[:5], 1):
            lines.append(
                f"{i}. {deal.score_emoji} **{deal.model_name}** — "
                f"{deal.buy_price:.0f}€ → +{deal.net_profit_fast:.0f}€ net"
            )
        embed.add_field(
            name="🏆  Meilleurs deals du cycle",
            value="\n".join(lines),
            inline=False,
        )

    embed.set_footer(
        text="COM9 Scanner  •  Powered by Com'9 Repair",
        icon_url=COM9_LOGO_URL,
    )
    return embed


def build_error_embed(error_msg: str) -> discord.Embed:
    embed = discord.Embed(
        title="❌  Erreur COM9 Scanner",
        description=f"```\n{error_msg}\n```",
        color=0xFF3333,
        timestamp=datetime.utcnow(),
    )
    embed.set_footer(text="COM9 Scanner")
    return embed
