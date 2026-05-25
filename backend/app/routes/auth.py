from fastapi import APIRouter, HTTPException, status
from firebase_admin import auth as firebase_auth
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import httpx
from app.core.firebase_admin import get_auth, get_firestore
from app.schemas.auth import RegisterRequest, LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest, SuccessResponse
from app.core.security import create_access_token, create_reset_token, verify_reset_token
from app.core.email import send_reset_email
from datetime import timedelta
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    fb_auth = get_auth()
    db = get_firestore()

    try:
        user_record = fb_auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.name,
        )
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar usuário: {str(e)}")

    try:
        db.collection("users").document(user_record.uid).set({
            "name": request.name,
            "email": request.email,
            "role": request.role,
            "createdAt": SERVER_TIMESTAMP,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no Firestore: {str(e)}")

    return SuccessResponse(success=True, message="Cadastro realizado com sucesso!")


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Verifica email + senha via Firebase REST API (Admin SDK não valida senha)
    firebase_url = (
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailAndPassword"
        f"?key={settings.firebase_api_key}"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.post(firebase_url, json={
            "email": request.email,
            "password": request.password,
            "returnSecureToken": True,
        })

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")

    fb_auth = get_auth()
    db = get_firestore()

    try:
        user_record = fb_auth.get_user_by_email(request.email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar usuário: {str(e)}")

    snap = db.collection("users").document(user_record.uid).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Usuário não encontrado no banco.")

    data = snap.to_dict()

    access_token = create_access_token(
        data={"sub": user_record.uid, "email": data["email"], "role": data["role"]},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_record.uid,
        email=data["email"],
        name=data["name"],
        role=data["role"],
    )


@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(request: ForgotPasswordRequest):
    fb_auth = get_auth()

    try:
        fb_auth.get_user_by_email(request.email)
    except firebase_auth.UserNotFoundError:
        return SuccessResponse(success=True, message="Se o email existir, um link foi enviado.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    reset_token = create_reset_token(request.email)
    sent = send_reset_email(request.email, reset_token)
    if not sent:
        raise HTTPException(status_code=500, detail="Erro ao enviar email de recuperação.")

    return SuccessResponse(success=True, message="Se o email existir, um link foi enviado.")


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(request: ResetPasswordRequest):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    fb_auth = get_auth()
    try:
        user_record = fb_auth.get_user_by_email(email)
        fb_auth.update_user(user_record.uid, password=request.new_password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao redefinir senha: {str(e)}")

    return SuccessResponse(success=True, message="Senha redefinida com sucesso!")
