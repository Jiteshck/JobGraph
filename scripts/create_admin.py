"""Provision an administrator account explicitly from the local terminal.

The email must already be listed in ADMIN_EMAILS in .env. This script never
creates admin privileges from public signup or from an email-name heuristic.
"""
from __future__ import annotations

import getpass
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
sys.path.insert(0, str(ROOT))

from server import ADMIN_EMAILS, hash_password, load_env_file  # noqa: E402
from database import init_database, find_user_by_email, create_user, set_user_role, close_database  # noqa: E402


def main() -> None:
    load_env_file(str(ROOT / ".env"))
    email = input("Administrator email (must be in ADMIN_EMAILS): ").strip().lower()
    if not email or email not in ADMIN_EMAILS:
        raise SystemExit("Refusing to provision: add this exact email to ADMIN_EMAILS in .env first.")

    password = getpass.getpass("Password (minimum 12 characters): ")
    confirm = getpass.getpass("Confirm password: ")
    if len(password) < 12 or password != confirm:
        raise SystemExit("Passwords must match and contain at least 12 characters.")

    init_database()
    try:
        existing = find_user_by_email(email)
        if existing:
            from database import update_user
            update_user(email, {"password_hash": hash_password(password)})
            set_user_role(email, "admin")
            print(f"Promoted existing account {email} to admin and updated its password.")
        else:
            name = input("Administrator display name: ").strip()
            if len(name) < 2:
                raise SystemExit("Display name must contain at least 2 characters.")
            user_id = f"user-{uuid.uuid4()}"
            create_user({
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hash_password(password),
                "role": "admin",
                "student_id": None,
                "roll_no": None,
                "provider": "password",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            print(f"Created administrator account for {email}.")
    finally:
        close_database()


if __name__ == "__main__":
    main()
