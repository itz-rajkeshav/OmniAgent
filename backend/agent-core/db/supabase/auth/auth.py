from fastapi import HTTPException, Header
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from datetime import datetime, timedelta

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(supabase_url, supabase_key)

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

class GoogleAuthRequest(BaseModel):
    id_token: str
    email: str
    name: str = None

def verify_google_token(token: str):
    try:
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not google_client_id:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured in backend")
        
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            google_client_id
        )
        
        
        return {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "sub": idinfo.get("sub"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

def create_jwt_token(user_id: str, email: str, name: str = None):
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def authenticate_google_user(request: GoogleAuthRequest):
    try:
        google_user = verify_google_token(request.id_token)

        result = supabase.table("users").select("*").eq("email", google_user["email"]).execute()
        
        if len(result.data) > 0:
            user = result.data[0]
            google_id = user.get("google_id") or google_user["sub"]
            
            jwt_token = create_jwt_token(google_id, google_user["email"], google_user.get("name"))
            
            return {
                "user":{
                    "id": google_id,
                    "email": google_user["email"],
                    "name": google_user.get("name"),
                    "picture": google_user.get("picture"),
                },
                "token": jwt_token,
                "verified": True
            }
        else:
            new_user = {
                "email": google_user["email"],
                "name": google_user.get("name"),
                "picture": google_user.get("picture"),
                "google_id": google_user["sub"]
            }
            insert_result = supabase.table("users").insert(new_user).execute()
            google_id = google_user["sub"]
        
        jwt_token = create_jwt_token(google_id, google_user["email"], google_user.get("name"))
        
        return {
            "user": {
                "id": google_id,
                "email": google_user["email"],
                "name": google_user.get("name"),
                "picture": google_user.get("picture"),
            },
            "token": jwt_token,
            "verified": True
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def verify_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ")[1]
    
    try:
        payload = verify_jwt_token(token)
        return payload 
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
