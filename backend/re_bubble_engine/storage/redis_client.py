import json
import asyncio
from typing import Any, Optional
from redis import asyncio as aioredis
from redis.exceptions import ConnectionError, TimeoutError
from config import settings
from models.macro import MacroSnapshot

class MockPubSub:
    async def subscribe(self, *args, **kwargs):
        return None
    async def get_message(self, *args, **kwargs):
        await asyncio.sleep(1.0)
        return None

class MockRedis:
    _data = {}

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> Optional[str]:
        # Strip json serialization if present, or return as is
        val = self._data.get(key)
        if val is not None:
            try:
                # Try to decode if it is a JSON serialized string
                return json.loads(val)
            except json.JSONDecodeError:
                return val
        return None

    async def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        self._data[key] = json.dumps(value) if not isinstance(value, str) else value
        return True

    async def delete(self, *keys: str) -> int:
        count = 0
        for key in keys:
            if key in self._data:
                del self._data[key]
                count += 1
        return count

    async def publish(self, channel: str, message: str) -> int:
        return 0

    def pubsub(self):
        return MockPubSub()

class SmartPubSubProxy:
    def __init__(self, real_pubsub):
        self._real_pubsub = real_pubsub
        self._mock_pubsub = MockPubSub()

    def __getattr__(self, name):
        if SmartRedisProxy._use_mock:
            return getattr(self._mock_pubsub, name)

        attr = getattr(self._real_pubsub, name)
        if callable(attr):
            def wrapper(*args, **kwargs):
                if SmartRedisProxy._use_mock:
                    return getattr(self._mock_pubsub, name)(*args, **kwargs)
                try:
                    res = attr(*args, **kwargs)
                    if asyncio.iscoroutine(res):
                        async def async_wrapper():
                            try:
                                return await res
                            except (ConnectionError, TimeoutError, OSError) as e:
                                print(f"[REDIS FALLBACK] PubSub connection error during async {name}: {e}. Switching to MockRedis.")
                                SmartRedisProxy._use_mock = True
                                return await getattr(self._mock_pubsub, name)(*args, **kwargs)
                        return async_wrapper()
                    return res
                except (ConnectionError, TimeoutError, OSError) as e:
                    print(f"[REDIS FALLBACK] PubSub connection error during sync {name}: {e}. Switching to MockRedis.")
                    SmartRedisProxy._use_mock = True
                    return getattr(self._mock_pubsub, name)(*args, **kwargs)
            return wrapper
        return attr

class SmartRedisProxy:
    _mock_instance = MockRedis()
    _use_mock = False

    def __init__(self, real_client: aioredis.Redis):
        self._real_client = real_client

    def __getattr__(self, name):
        if SmartRedisProxy._use_mock:
            return getattr(SmartRedisProxy._mock_instance, name)

        attr = getattr(self._real_client, name)
        if callable(attr):
            def wrapper(*args, **kwargs):
                if SmartRedisProxy._use_mock:
                    return getattr(SmartRedisProxy._mock_instance, name)(*args, **kwargs)
                try:
                    res = attr(*args, **kwargs)
                    if name == "pubsub":
                        return SmartPubSubProxy(res)
                    if asyncio.iscoroutine(res):
                        async def async_wrapper():
                            try:
                                return await res
                            except (ConnectionError, TimeoutError, OSError) as e:
                                print(f"[REDIS FALLBACK] Connection error during async {name}: {e}. Switching to MockRedis.")
                                SmartRedisProxy._use_mock = True
                                if name == "pubsub":
                                    return MockPubSub()
                                return await getattr(SmartRedisProxy._mock_instance, name)(*args, **kwargs)
                        return async_wrapper()
                    return res
                except (ConnectionError, TimeoutError, OSError) as e:
                    print(f"[REDIS FALLBACK] Connection error during sync {name}: {e}. Switching to MockRedis.")
                    SmartRedisProxy._use_mock = True
                    if name == "pubsub":
                        return MockPubSub()
                    return getattr(SmartRedisProxy._mock_instance, name)(*args, **kwargs)
            return wrapper
        return attr


def get_redis() -> aioredis.Redis:
    url = settings.REDIS_URL
    if "upstash.io" in url and url.startswith("redis://"):
        url = url.replace("redis://", "rediss://")
        
    real_client = aioredis.from_url(
        url, 
        encoding="utf-8", 
        decode_responses=True
    )
    return SmartRedisProxy(real_client)

async def cache_set(key: str, value: Any, ttl_seconds: int = 3600):
    redis = get_redis()
    await redis.set(key, value, ex=ttl_seconds)

async def cache_get(key: str) -> Optional[Any]:
    redis = get_redis()
    data = await redis.get(key)
    if data is None:
        return None
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return data
    return data

async def build_macro_snapshot(region: str = "national") -> MacroSnapshot:
    redis = get_redis()
    
    # Base mapping for national indicators
    mapping = {
        "wb:GDP_GROWTH": "gdp_growth",
        "wb:CPI_YOY": "cpi_yoy",
        "wb:UNEMPLOYMENT": "unemployment_rate",
        "wb:HOME_LOAN_RATE": "home_loan_rate",
        "wb:GNPA": "gnpa_ratio",
        "wb:M3_GROWTH": "m3_money_supply",
        "wb:WPI_YOY": "wpi_inflation",
        "rbi:REPO_RATE": "repo_rate",
        "rbi:GSEC_10Y": "gsec_10y_yield",
        "rbi:GSEC_2Y": "gsec_2y_yield",
        "rbi:HOUSING_CREDIT": "housing_credit",
        "rbi:CONSUMER_CONFIDENCE": "consumer_confidence",
        "nhb:RESIDEX_COMPOSITE": "nhb_residex_composite",
        "india:MEDIAN_HOME_PRICE": "median_home_price_inr",
        "india:MEDIAN_HH_INCOME": "median_household_income_inr"
    }

    # Add regional mapping overrides
    region_upper = region.upper()
    city_residex_key = f"nhb:RESIDEX_{region_upper}"
    
    snapshot_data = {}
    for redis_key, field_name in mapping.items():
        # Check for city-specific override first for 'india:' patterns
        key_to_fetch = redis_key
        if redis_key.startswith("india:") and region.upper() != "NATIONAL":
            city_override_key = f"{redis_key}_{region_upper}"
            override_val = await redis.get(city_override_key)
            if override_val is not None:
                key_to_fetch = city_override_key

        val = await redis.get(key_to_fetch)
        if val is not None:
            try:
                snapshot_data[field_name] = float(val)
            except (ValueError, TypeError):
                snapshot_data[field_name] = None
    
    # Specific city index override
    city_val = await redis.get(city_residex_key)
    if city_val:
        snapshot_data["nhb_residex_composite"] = float(city_val)

    # Store city-specific Residex keys for the frontend
    # This loop ensures we catch all 8 cities for the sidebar/HUD
    for city in ["MUMBAI", "DELHI", "BANGALORE", "CHENNAI", "HYDERABAD", "KOLKATA", "PUNE", "AHMEDABAD"]:
        idx_val = await redis.get(f"nhb:RESIDEX_{city}")
        if idx_val:
            snapshot_data[f"nhb_residex_{city.lower()}"] = float(idx_val)
                
    return MacroSnapshot(**snapshot_data)

async def publish_event(channel: str, event_dict: dict):
    redis = get_redis()
    await redis.publish(channel, json.dumps(event_dict))

