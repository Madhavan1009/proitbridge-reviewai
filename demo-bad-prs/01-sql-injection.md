# Demo PR 01 — SQL Injection

**Branch:** `demo-01-user-lookup`
**PR title:** `Add user lookup by ID for support dashboard`
**Commit:** `Add user lookup endpoint for support team`

## The bad code

**File:** `src/auth.py`

```python
"""User authentication and lookup utilities."""

import sqlite3

db = sqlite3.connect("app.db")


def get_user(user_id):
    """Look up a user by ID — used by the support dashboard."""
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()


def list_users():
    return db.execute("SELECT id, email FROM users LIMIT 100").fetchall()
```

## What the bot should catch

| Severity | Category | Line | Issue |
| --- | --- | --- | --- |
| **Critical** | Security | 11 | SQL injection via f-string — `user_id` is interpolated directly into the query. |
| **High** | Test | 11 | No test coverage for `get_user`. `auth.py` is a security boundary; add a test for valid and malformed input. |
| **Medium** | Bug | 12 | `fetchone()` may return `None` — caller assumes a tuple. Add an explicit `None` check before unpacking. |

## Expected bot summary comment

> ## ReviewAI · Code Review Summary
>
> 🔍 **3 findings** in 1 file · Severity: 1 critical · 1 high · 1 medium
>
> | File | Findings |
> | --- | --- |
> | `src/auth.py` | 🔒 SQL injection · 🧪 Missing tests · 🐛 Null deref |
>
> **Verdict:** Changes requested. The SQL injection is critical and must be fixed before merge.
