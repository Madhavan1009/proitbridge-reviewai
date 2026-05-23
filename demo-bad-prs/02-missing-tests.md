# Demo PR 02 — Missing Tests on Critical Function

**Branch:** `demo-02-transfer`
**PR title:** `Implement balance transfer between accounts`
**Commit:** `Add transfer() — debits from one account, credits to another`

## The bad code

**File:** `src/payments.py`

```python
"""Account balance and transfer operations."""


def transfer(from_id, to_id, amount):
    db.execute(
        f"UPDATE accounts SET balance = balance - {amount} WHERE id = {from_id}"
    )
    db.execute(
        f"UPDATE accounts SET balance = balance + {amount} WHERE id = {to_id}"
    )
    return {"from": from_id, "to": to_id, "amount": amount}
```

**Note:** No file `tests/test_payments.py` is added.

## What the bot should catch

| Severity | Category | Line | Issue |
| --- | --- | --- | --- |
| **Critical** | Security | 6 | Balance transfer is not wrapped in a transaction — a crash between the two UPDATEs will lose money. |
| **Critical** | Security | 6 | SQL injection via f-string on `amount` and `from_id`. |
| **High** | Bug | 4 | No validation that `amount` is positive — negative amounts effectively let a sender drain the receiver. |
| **High** | Test | 4 | No test file added for a money-handling function. This is the kind of code that absolutely needs unit tests. |

## Why this PR matters for the demo

This is the bot's chance to demonstrate **layered intelligence**. A linter
would catch the SQL injection. But the bot also notices:

- No `with db.transaction():` block — that's *semantic* understanding.
- No validation on `amount` — that's *security mindset*.
- No test file added — that's *meta-awareness of the diff as a whole*.

When all four findings land at once, the audience realizes the bot isn't
pattern-matching — it's reasoning about the change.
