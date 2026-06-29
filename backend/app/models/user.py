<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

=======
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

>>>>>>> bd3d57927d968e913756fe5448cd8ce4bec193ed
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)

    password_hash = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
=======
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
>>>>>>> bd3d57927d968e913756fe5448cd8ce4bec193ed
