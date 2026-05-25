"""General-purpose utilities."""


def find_duplicates(items):
    """Return items that appear more than once in the input list."""
    duplicates = []
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates
