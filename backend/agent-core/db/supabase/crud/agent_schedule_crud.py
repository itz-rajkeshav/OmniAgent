from sqlalchemy.orm import Session
from datetime import datetime
from ..models.agent_schedule import AgentSchedule


DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def upsert_agent_schedule(
    db: Session,
    user_id: str,
    day: int,
    start_time: str,
    end_time: str,
    is_enabled: bool,
    timezone: str = "Asia/Kolkata",
):
    """Insert or update a single day's schedule for a user."""
    if day < 0 or day > 6:
        return {"status": "error", "message": f"Invalid day: {day}. Must be 0-6."}

    existing = (
        db.query(AgentSchedule)
        .filter(AgentSchedule.user_id == user_id, AgentSchedule.day == day)
        .first()
    )

    if existing:
        existing.start_time = start_time
        existing.end_time = end_time
        existing.is_enabled = is_enabled
        existing.timezone = timezone
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return {"status": "success", "message": "Schedule updated", "schedule": existing}
    else:
        new_entry = AgentSchedule(
            user_id=user_id,
            day=day,
            start_time=start_time,
            end_time=end_time,
            is_enabled=is_enabled,
            timezone=timezone,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return {"status": "success", "message": "Schedule created", "schedule": new_entry}


def bulk_upsert_agent_schedule(
    db: Session,
    user_id: str,
    entries: list[dict],
    timezone: str = "Asia/Kolkata",
):
    """
    Insert or update multiple day entries at once.
    Each entry: { "day": int, "start_time": str, "end_time": str, "is_enabled": bool }
    """
    results = []
    for entry in entries:
        result = upsert_agent_schedule(
            db=db,
            user_id=user_id,
            day=entry["day"],
            start_time=entry.get("start_time", "09:00"),
            end_time=entry.get("end_time", "18:00"),
            is_enabled=entry.get("is_enabled", True),
            timezone=timezone,
        )
        results.append(result)

    failed = [r for r in results if r["status"] != "success"]
    if failed:
        return {"status": "error", "message": "Some entries failed", "results": results}
    return {"status": "success", "message": "Schedule saved", "results": results}


def get_agent_schedule(db: Session, user_id: str):
    """Get all schedule entries for a user (up to 7 days)."""
    entries = (
        db.query(AgentSchedule)
        .filter(AgentSchedule.user_id == user_id)
        .order_by(AgentSchedule.day)
        .all()
    )
    if entries:
        return {"status": "success", "entries": entries, "timezone": entries[0].timezone}
    return {"status": "error", "message": "No schedule found"}


def delete_agent_schedule(db: Session, user_id: str):
    """Delete all schedule entries for a user."""
    count = db.query(AgentSchedule).filter(AgentSchedule.user_id == user_id).delete()
    db.commit()
    return {"status": "success", "message": f"Deleted {count} schedule entries"}
