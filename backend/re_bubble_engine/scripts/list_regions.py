import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

from storage.db import AsyncSessionLocal
from storage.models.bubble_flags import BubbleFlag
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(BubbleFlag.region).distinct())
        regions = result.scalars().all()
        print(f"Regions in DB: {regions}")

if __name__ == "__main__":
    asyncio.run(main())
