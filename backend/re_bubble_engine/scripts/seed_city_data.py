import asyncio
import json
from storage.redis_client import get_redis

async def seed():
    r = get_redis()
    
    # 1. National Baselines (Existing)
    await r.set("wb:HOME_LOAN_RATE", "8.75")
    await r.set("rbi:REPO_RATE", "6.5")
    await r.set("rbi:GSEC_10Y", "6.83")

    # 2. City-Specific Risk Signatures (Prices in Lakhs, Income in Lakhs/yr)
    cities = {
        "MUMBAI": {
            "price": "145.0",
            "income": "12.0",
            "residex": "168.4"
        },
        "DELHI": {
            "price": "95.0",
            "income": "11.0",
            "residex": "152.1"
        },
        "BANGALORE": {
            "price": "88.0",
            "income": "14.5",
            "residex": "145.8"
        },
        "CHENNAI": {
            "price": "72.0",
            "income": "10.8",
            "residex": "138.2"
        },
        "HYDERABAD": {
            "price": "68.0",
            "income": "11.2",
            "residex": "141.5"
        },
        "AHMEDABAD": {
            "price": "48.0",
            "income": "9.5",
            "residex": "125.4"
        },
        "PUNE": {
            "price": "75.0",
            "income": "12.5",
            "residex": "134.9"
        },
        "KOLKATA": {
            "price": "55.0",
            "income": "8.5",
            "residex": "128.6"
        }
    }

    for city, data in cities.items():
        # Core metrics used by the Risk Agent
        await r.set(f"india:MEDIAN_HOME_PRICE_{city}", data["price"])
        await r.set(f"india:MEDIAN_HH_INCOME_{city}", data["income"])
        await r.set(f"nhb:RESIDEX_{city}", data["residex"])
        
        print(f"Seeded {city}: Price={data['price']}, Income={data['income']}, Residex={data['residex']}")

    print("Seed complete. Engine now has unique regional profiles.")

if __name__ == "__main__":
    asyncio.run(seed())
