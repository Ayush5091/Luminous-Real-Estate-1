import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from ingestion.ingest_coordinator import IngestCoordinator

async def main():
    print("🚀 Starting manual Residex data refresh...")
    coordinator = IngestCoordinator()
    result = await coordinator.run_macro_refresh()
    print(f"📊 Refresh Result: {result}")
    print("✅ Refresh complete.")

if __name__ == "__main__":
    asyncio.run(main())
