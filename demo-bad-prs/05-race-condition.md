# Demo PR 05 — TOCTOU Race Condition

**Branch:** `demo-05-counter-increment`
**PR title:** `Cache-backed counter for rate limiting`
**Commit:** `Add increment_counter() for rate limiter`

## The bad code

**File:** `src/cache.py`

```python
"""Redis-backed cache helpers for the rate limiter."""

import redis

cache = redis.Redis()


def increment_counter(key):
    """Increment a counter stored in the cache."""
    value = cache.get(key) or 0
    cache.set(key, value + 1)
    return value + 1
```

## What the bot should catch

| Severity | Category | Line | Issue |
| --- | --- | --- | --- |
| **High** | Bug | 10 | TOCTOU race condition: get-then-set is not atomic. Under concurrent requests, two callers can both read the old value and both write old+1, losing an increment. |
| **Medium** | Bug | 10 | `cache.get(key)` returns `bytes` in real Redis — `or 0` then `+ 1` will TypeError. |

## Expected suggestion

```python
def increment_counter(key):
    """Increment a counter stored in the cache."""
    return cache.incr(key)
```

## Why this PR matters for the demo

This is the **closer** of the five demos. The race condition is non-obvious
— a junior reviewer would miss it. The bot's rationale ("two simultaneous
callers can both read old, both write old+1, losing an increment")
demonstrates real concurrency understanding.

Bonus catch: the `bytes` return type from real Redis. The bot has read
enough Redis client code to know that the in-memory mock returns int but
the real client returns bytes. That's the moment the audience realizes
this isn't just an AST scanner — it has *world knowledge*.
