from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, UniqueConstraint

from db.supabase.connectDB import Base


class AgentSchedule(Base):
    __tablename__ = "agent_schedules"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_agent_schedule_user_day"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    day = Column(Integer, nullable=False, index=True)  # 0 (Monday) to 6 (Sunday)
    start_time = Column(String, nullable=False, default="09:00")
    end_time = Column(String, nullable=False, default="18:00")
    is_enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
