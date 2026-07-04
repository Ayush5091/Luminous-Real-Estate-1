import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from storage.db import AsyncSessionLocal
from sqlalchemy import select
from storage.models.bubble_flags import BubbleFlag

async def check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(BubbleFlag.region, BubbleFlag.overall_score))
        rows = result.all()
        print(f"Found {len(rows)} bubble flags:")
        for r in rows:
            print(f" - {r.region}: {r.overall_score}")

if __name__ == "__main__":
    asyncio.run(check())
