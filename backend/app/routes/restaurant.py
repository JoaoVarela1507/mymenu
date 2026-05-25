from fastapi import APIRouter, HTTPException, status, Query
from firebase_admin import auth as firebase_auth
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from app.core.firebase_admin import get_auth, get_firestore
from app.schemas.restaurant import RegisterRestaurantRequest, RegisterRestaurantResponse

router = APIRouter(prefix="/restaurant", tags=["Restaurant"])


@router.get("/check-email")
async def check_email(email: str = Query(...)):
    fb_auth = get_auth()
    db = get_firestore()
    try:
        user = fb_auth.get_user_by_email(email)
        has_restaurant = db.collection("userRestaurant").document(user.uid).get().exists
        user_doc = db.collection("users").document(user.uid).get()
        name = ""
        has_consumer = False
        if user_doc.exists:
            data = user_doc.to_dict()
            name = data.get("name", "")
            role = data.get("role") or data.get("type")
            has_consumer = data.get("hasConsumerProfile") is True or role == "consumer"
        return {
            "exists": True,
            "has_restaurant": has_restaurant,
            "has_consumer": has_consumer,
            "name": name,
        }
    except firebase_auth.UserNotFoundError:
        return {"exists": False, "has_restaurant": False, "has_consumer": False, "name": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register", response_model=RegisterRestaurantResponse, status_code=status.HTTP_201_CREATED)
async def register_restaurant(request: RegisterRestaurantRequest):
    fb_auth = get_auth()
    db = get_firestore()

    uid = None
    email_already_existed = False

    if not request.password:
        # Email já existe (sem senha enviada) — busca uid diretamente
        try:
            existing = fb_auth.get_user_by_email(request.email)
            uid = existing.uid
            email_already_existed = True
        except firebase_auth.UserNotFoundError:
            raise HTTPException(status_code=400, detail="Email não encontrado. Cadastre-se primeiro como consumidor.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao buscar usuário: {str(e)}")
    else:
        try:
            user_record = fb_auth.create_user(
                email=request.email,
                password=request.password,
                display_name=request.name,
            )
            uid = user_record.uid
        except firebase_auth.EmailAlreadyExistsError:
            try:
                existing = fb_auth.get_user_by_email(request.email)
                uid = existing.uid
                email_already_existed = True
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro ao buscar usuário: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao criar usuário no Auth: {str(e)}")

    # Verifica se já tem restaurante cadastrado para esse uid
    existing_rest = db.collection("userRestaurant").document(uid).get()
    if existing_rest.exists:
        raise HTTPException(status_code=400, detail="Este email já possui um restaurante cadastrado.")

    try:
        # Atualiza role para admin (merge para não sobrescrever outros campos)
        # hasConsumerProfile=True permite que o dono acesse o app como cliente também
        db.collection("users").document(uid).set({
            "name": request.name,
            "email": request.email,
            "phone": request.phone,
            "role": "admin",
            "hasConsumerProfile": True,
            "createdAt": SERVER_TIMESTAMP,
        }, merge=True)

        db.collection("userRestaurant").document(uid).set({
            "ownerId": uid,
            "ownerName": request.name,
            "ownerEmail": request.email,
            "ownerPhone": request.phone,
            "restaurantName": request.restaurant_name,
            "cnpj": request.cnpj,
            "restaurantPhone": request.restaurant_phone,
            "category": request.category,
            "address": request.address,
            "city": request.city,
            "state": request.state,
            "cep": request.cep,
            "description": request.description,
            "plan": "basico",
            "isActive": False,
            "createdAt": SERVER_TIMESTAMP,
        })

        msg = "Restaurante vinculado à sua conta existente!" if email_already_existed else "Cadastro realizado com sucesso!"
        return RegisterRestaurantResponse(success=True, message=msg, uid=uid)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no Firestore: {str(e)}")
