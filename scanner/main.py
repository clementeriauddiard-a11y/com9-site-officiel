"""
COM9 Scanner — Point d'entrée principal
Lance le bot Discord + configure le logging.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Charge le .env si présent (développement local)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass  # python-dotenv optionnel en production

from bot import COM9Bot, register_slash_commands


def _setup_logging() -> None:
    level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format="%(asctime)s  [%(levelname)-8s]  %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )
    # Réduit le bruit de discord.py
    logging.getLogger("discord.gateway").setLevel(logging.WARNING)
    logging.getLogger("discord.http").setLevel(logging.WARNING)


async def main() -> None:
    _setup_logging()
    logger = logging.getLogger("main")

    token = os.environ.get("DISCORD_TOKEN")
    if not token:
        logger.error("DISCORD_TOKEN manquant. Vérifiez votre fichier .env")
        sys.exit(1)

    bot = COM9Bot()

    async with bot:
        await register_slash_commands(bot)
        logger.info("Démarrage de COM9 Scanner...")
        await bot.start(token)


if __name__ == "__main__":
    asyncio.run(main())
