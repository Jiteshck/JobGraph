"""Smoke-test the running Job Skill Matcher API without modifying database data.

Usage (backend must be running):
  python tests/smoke_test_api.py
  JOBMATCH_API_URL=http://127.0.0.1:8000 python tests/smoke_test_api.py

This checks public endpoints and verifies admin data is not exposed anonymously.
It does not create accounts or modify Neo4j records.
"""
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.getenv("JOBMATCH_API_URL", "http://127.0.0.1:8000").rstrip("/")


def request(path):
    req = urllib.request.Request(BASE + path, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            return response.status, response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8")


def fail(message):
    print(f"FAIL: {message}")
    return False


def main():
    ok = True
    print(f"Testing API at {BASE}")

    status, body = request("/api/health")
    if status != 200:
        ok = fail(f"/api/health returned HTTP {status}: {body}") and ok
    else:
        try:
            data = json.loads(body)
            if data.get("status") != "ok" or not data.get("database", {}).get("connected"):
                ok = fail(f"health endpoint reports database unavailable: {body}") and ok
            else:
                print("PASS: health endpoint and Neo4j connection")
        except (ValueError, AttributeError):
            ok = fail("health endpoint returned unexpected JSON") and ok

    for path, key in (("/api/skills", "skills"), ("/api/jobs", "jobs"), ("/api/companies", "companies")):
        status, body = request(path)
        if status != 200:
            ok = fail(f"{path} returned HTTP {status}: {body}") and ok
            continue
        try:
            data = json.loads(body)
            if not isinstance(data.get(key), list):
                ok = fail(f"{path} response does not contain a '{key}' list") and ok
            else:
                print(f"PASS: {path} ({len(data[key])} records returned)")
        except ValueError:
            ok = fail(f"{path} returned invalid JSON") and ok

    status, body = request("/api/admin/students")
    if status not in (401, 403):
        ok = fail(f"unauthenticated /api/admin/students should return 401/403, got {status}") and ok
    else:
        print("PASS: admin student endpoint blocks unauthenticated access")

    if ok:
        print("\nSmoke tests passed. These checks do not replace full student/admin workflow testing.")
        return 0
    print("\nSome smoke tests failed. Fix the reported issue(s) before the demo.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
