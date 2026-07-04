import asyncio
from storage.redis_client import redis

async def check_residex():
    keys = [
        "nhb:RESIDEX_COMPOSITE",
        "nhb:RESIDEX_MUMBAI",
        "nhb:RESIDEX_BANGALORE"
    ]
    print("--- Current Redis Residex Values ---")
    for key in keys:
        val = await redis.get(key)
        print(f"{key}: {val}")

if __name__ == "__main__":
    asyncio.run(check_residex())
