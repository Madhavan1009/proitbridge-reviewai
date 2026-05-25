"""Redis-backed cache helpers for the rate limiter."""
import redis

cache = redis.Redis()


def increment_counter(key):
    """Increment a counter stored in the cache."""
    value = cache.get(key) or 0
    cache.set(key, value + 1)
    return value + 1
