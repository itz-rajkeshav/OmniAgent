from fastapi import APIRouter, Depends, HTTPException
from .auth import authenticate_google_user, GoogleAuthRequest, verify_user

router = APIRouter()


@router.post("/auth/google")
async def google_auth(request: GoogleAuthRequest):
    try:
        
        result = authenticate_google_user(request.id_token, request.email, request.name)        
        return {
            "user": result["user"],
            "token": result["token"],
            "verified": result["verified"],
            "message": "Google authentication successful"
        }
    except Exception as e:
        print(f"❌ Unexpected error in google_auth: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/auth/me")
async def get_current_user(user = Depends(verify_user)):
    return {
        "user": user,
        "message": "User retrieved successfully"
    }