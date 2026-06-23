from app.core.database import Base, engine
from app.models.user import User

# This creates all tables in database
Base.metadata.create_all(bind=engine)

print("User table created successfully")