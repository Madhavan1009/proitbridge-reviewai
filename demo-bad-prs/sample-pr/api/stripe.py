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
