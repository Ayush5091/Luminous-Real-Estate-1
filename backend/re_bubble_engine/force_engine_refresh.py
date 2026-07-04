import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from scheduler.jobs.job_macro_refresh import run_macro_refresh_job
from scheduler.jobs.job_agent_run import run_agent_job
from storage.db import init_db

async def force_refresh():
    print("Initializing DB...")
    await init_db()
    print("Triggering Macro Data Ingestion (Scraping RBI, World Bank, NHB)...")
    await run_macro_refresh_job()
    print("Triggering Global Agent Refresh for all cities...")
    await run_agent_job()
    print("Refresh complete.")

if __name__ == "__main__":
    asyncio.run(force_refresh())

