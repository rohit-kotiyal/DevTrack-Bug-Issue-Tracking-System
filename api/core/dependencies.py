from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt
from api.core.security import SECRET_KEY, ALGORITHM
from users.models import User

security = HTTPBearer()

def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return User.objects.get(id=user_id)

    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token")
    