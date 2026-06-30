from app.core.database import Base, engine

from app.modules.auth.models import User
from app.modules.applications.models import Application
from app.modules.activity.models import ActivityLog
from app.modules.notifications.models import Notification

Base.metadata.create_all(bind=engine)

print("Database created successfully")