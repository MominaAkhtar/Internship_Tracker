"""
Quick seed script to populate Career Insights (average response time +
response time analysis) with realistic-looking demo data RIGHT NOW.

USAGE:
  1. Place this file in the `backend/` folder (next to create_db.py).
  2. Edit USER_EMAIL below to match the account you'll log in with for the demo.
  3. Run:  python seed_insights_data.py
  4. Refresh the Insights page in the app.

It creates a handful of applications with backdated `created_at` timestamps,
then writes STATUS_CHANGED activity logs a few days later for each -- which
is exactly what the Career Insights service reads to compute response times.
"""

from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.applications.models import Application
from app.modules.activity.models import ActivityLog, ActivityType

# ---- EDIT THIS to the account you'll demo with ----
USER_EMAIL = "raimafaisal2005@gmail.com"
# ----------------------------------------------------

# (company, position, days_ago_applied, final_status, days_until_response)
SEED_DATA = [
    ("Google",    "Software Engineer",        14, "Interview", 3),
    ("Microsoft", "Backend Developer",         12, "Interview", 5),
    ("Amazon",    "Full Stack Developer",      20, "Rejected",  9),
    ("Meta",      "Frontend Engineer",         18, "Rejected",  7),
    ("Netflix",   "Data Engineer",             10, "Offered",   6),
    ("Spotify",   "Product Engineer",          25, "Offered",   11),
    ("Stripe",    "Software Engineer II",       6, "Applied",   None),  # no response yet
]


def run():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == USER_EMAIL).first()
        if not user:
            print(f"No user found with email '{USER_EMAIL}'. "
                  f"Update USER_EMAIL in this script and re-run.")
            return

        now = datetime.utcnow()
        created_count = 0

        for company, position, days_ago, final_status, response_after_days in SEED_DATA:
            applied_at = now - timedelta(days=days_ago)

            app = Application(
                user_id=user.id,
                company_name=company,
                position=position,
                status="Applied" if response_after_days is None else final_status,
                created_at=applied_at,
                updated_at=applied_at,
            )
            db.add(app)
            db.flush()  # get app.id without committing yet

            # log the initial "created" activity (optional but realistic)
            db.add(ActivityLog(
                user_id=user.id,
                application_id=app.id,
                action_type=ActivityType.CREATE_APPLICATION,
                old_value=None,
                new_value="Applied",
                description=f"Application created for {position} at {company}",
                created_at=applied_at,
            ))

            if response_after_days is not None:
                response_at = applied_at + timedelta(days=response_after_days)
                db.add(ActivityLog(
                    user_id=user.id,
                    application_id=app.id,
                    action_type=ActivityType.STATUS_CHANGED,
                    old_value="Applied",
                    new_value=final_status,
                    description=f"Status changed from 'Applied' to '{final_status}'",
                    created_at=response_at,
                ))
                app.updated_at = response_at

            created_count += 1

        db.commit()
        print(f"Done. Seeded {created_count} applications with activity history "
              f"for {USER_EMAIL}.")
        print("Refresh the Insights page now.")

    finally:
        db.close()


if __name__ == "__main__":
    run()
