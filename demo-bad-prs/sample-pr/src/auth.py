"""User authentication and lookup utilities."""
import sqlite3

db = sqlite3.connect("app.db")


def get_user(user_id):
    """Look up a user by ID — used by the support dashboard."""
    query = f"SELECT * FROM users WHERE id={user_id}"
    return db.execute(query).fetchone()


def list_users():
    return db.execute("SELECT id, email FROM users LIMIT 100").fetchall()
