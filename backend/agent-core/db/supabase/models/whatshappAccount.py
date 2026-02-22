import string
from sqlalchemy import Column, column,Integer,String,DateTime, Enum as SQLEnum
from datetime import datetime, timezone
from db.supabase.connectDB import Base

class WhatshappAccount(Base):
    __tablename__ = "whatshapp_accounts"

    id = Column(Integer , autoincrement=True, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    phone_number = Column(String, nullable=False, index=True, unique=True)
    jid =Column(String, nullable=False, index=True, unique=True)
    status = Column(SQLEnum("active", "inactive", name="status_enum"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    def __repr__(self):
        return f"<WhatshappAccount(user_id={self.user_id}, phone_number={self.phone_number}, jid={self.jid})>"
