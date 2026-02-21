from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from datetime import datetime, timezone

from db.supabase.connectDB import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False, index=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserSource(Base):
    __tablename__ = "user_sources"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    source_id = Column(String, nullable=False, index=True) 
    source_type = Column(
        SQLEnum("website", "pdf", name="source_type_enum"),
        nullable=False
    )
    source_title=Column(String,nullable=False,index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<UserSource(user_id={self.user_id}, source_id={self.source_id}, type={self.source_type})>"