# Demo PR 04 — Hardcoded API Secret

**Branch:** `demo-04-stripe-charge`
**PR title:** `Add Stripe charge endpoint for one-off payments`
**Commit:** `Wire up Stripe charge endpoint`

## The bad code

**File:** `src/api.py`

```python
"""External payment integrations."""

import stripe

STRIPE_KEY = "<PASTE_REAL_LOOKING_STRIPE_KEY_WHEN_RECORDING>"


def charge_card(card, amount):
    """Charge a card via Stripe."""
    return stripe.Charge.create(
        api_key=STRIPE_KEY,
        amount=amount,
        currency="usd",
        source=card,
    )
```

> **Demo note:** When recording, paste a realistic-looking 32-char string
> with the `sk_live_` prefix into the file on-camera. We keep a placeholder
> in this checked-in fixture so GitHub's secret scanner doesn't reject the
> repository push. Stripe publishes one such well-known test value in their
> public API documentation if you want a "real" example to copy.

## What the bot should catch

| Severity | Category | Line | Issue |
| --- | --- | --- | --- |
| **Critical** | Security | 5 | Live Stripe API key hardcoded in source. Anyone with repo access has prod-charge capability. Rotate immediately. |
| **Medium** | Security | 9 | No idempotency key on the charge — retries will double-charge customers. |

## Expected suggestion

```python
import os
STRIPE_KEY = os.environ["STRIPE_KEY"]
```

## Why this PR matters for the demo

The audience sees `sk_live_` and immediately knows it's bad. The bot's
rationale ("rotate immediately, anyone with repo access has prod-charge
capability") drives home the **why** — not just the what.

This is the fixture that lands the "this would have cost us $100k" line in
the YouTube voiceover.

**⚠ Note:** Never paste real API keys into a public demo repo. The
placeholder in this file is intentionally non-functional; the on-camera
value should also be a public test key (e.g. from Stripe's docs) and not
anything tied to a real account.
