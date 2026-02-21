from sqlalchemy.orm import Session
from ..models.whatshappAccount import WhatshappAccount
from datetime import datetime

def create_whatshapp_account(db:Session, user_id:str, phone_number:str, jid:str):
    account_creation = WhatshappAccount(
        user_id=user_id,
        phone_number=phone_number,
        jid=jid,
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(account_creation)
    db.commit()
    db.refresh(account_creation)
    return {
        "status": "success",
        "message": "Whatshapp account created successfully",
        "account": account_creation
    }

def get_whatshapp_account(db:Session, user_id:str):
    account = db.query(WhatshappAccount).filter(WhatshappAccount.user_id == user_id).first()
    if account:
        return {
            "status": "success",
            "message": "Whatshapp account found",
            "account": account
        }
    return {
        "status": "error",
        "message": "Whatshapp account not found",
    }
def update_whatshapp_account(db: Session, user_id: str, phone_number: str = None, jid: str = None, status: str = None):
    account = db.query(WhatshappAccount).filter(WhatshappAccount.user_id == user_id).first()
    if not account:
        return {
            "status": "error",
            "message": "Whatshapp account not found",
        }
    if phone_number:
        account.phone_number = phone_number
    if jid:
        account.jid = jid
    if status:
        account.status = status
    account.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(account)
    return {
        "status": "success",
        "message": "Whatshapp account updated successfully",
        "account": account
    }