from sqlalchemy.orm import Session
from ..models.userModel import UserSource
from datetime import datetime


def create_user_source(db: Session, user_id: str, source_id: str, source_title:str, source_type: str):
    user_source = UserSource(
        user_id=user_id,
        source_id=source_id,
        source_title=source_title,
        source_type=source_type
    )
    db.add(user_source)
    db.commit()
    db.refresh(user_source)
    return user_source


def get_user_source(db: Session, user_id: str, source_id: str, source_title:str):
    return db.query(UserSource).filter(
        UserSource.user_id == user_id,
        UserSource.source_id == source_id,
        UserSource.source_title == source_title
    ).first()


def get_user_sources(db: Session, user_id: str):
    
    return db.query(UserSource).filter(UserSource.user_id == user_id).all()


def delete_user_source(db: Session, user_id: str, source_id: str, source_title:str):
    source = get_user_source(db, user_id, source_id, source_title)
    if source:
        db.delete(source)
        db.commit()
        return True
    return False


def upsert_user_source(db: Session, user_id: str, source_id: str, source_title:str, source_type: str = "pdf"):
    existing = get_user_source(db, user_id, source_id, source_title)
    
    if existing:
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing, False
    else:
        new_source = create_user_source(db, user_id, source_id, source_title, source_type)
        return new_source, True


def get_source_ids_by_type(db: Session, user_id: str, source_type: str):
    results = db.query(UserSource.source_id).filter(
        UserSource.user_id == user_id,
        UserSource.source_type == source_type
    ).all()
    return [result[0] for result in results]
