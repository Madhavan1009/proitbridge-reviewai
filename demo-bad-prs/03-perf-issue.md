# Demo PR 03 — O(n²) Performance Bug

**Branch:** `demo-03-find-duplicates`
**PR title:** `Add find_duplicates() helper for batch dedup`
**Commit:** `Helper to find duplicate items in a list`

## The bad code

**File:** `src/utils.py`

```python
"""General-purpose utilities."""


def find_duplicates(items):
    """Return items that appear more than once in the input list."""
    duplicates = []
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates
```

## What the bot should catch

| Severity | Category | Line | Issue |
| --- | --- | --- | --- |
| **Medium** | Performance | 8 | `find_duplicates` is O(n²) — use `collections.Counter` for O(n). |
| **Low** | Bug | 11 | Each duplicate is appended twice (once for each direction of the pair). The output will have duplicates of duplicates. |

## Expected suggestion

The bot should propose:

```python
from collections import Counter

def find_duplicates(items):
    """Return items that appear more than once in the input list."""
    return [x for x, c in Counter(items).items() if c > 1]
```

## Why this PR matters for the demo

The performance issue is **visual**. The audience sees the nested for-loop
and immediately recognizes it. The Counter suggestion is the kind of fix
they'd applaud a senior engineer for — and the bot delivers it as a
one-click suggestion block they can commit directly.
