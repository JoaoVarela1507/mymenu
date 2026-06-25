import pytest
from datetime import timedelta
from fastapi import APIRouter, Depends, status
from main import app
from app.core.security import get_current_user, check_role, create_access_token

# Define a test-only router to test dependencies in an integration context
router = APIRouter(prefix="/test-protected")

@router.get("/user")
def endpoint_user_route(user: dict = Depends(get_current_user)):
    return {"message": "Access granted", "user": user}

@router.get("/admin")
def endpoint_admin_route(user: dict = Depends(check_role("admin"))):
    return {"message": "Admin access granted", "user": user}

# Mount the router
app.include_router(router)

# Test 1: Token válido
def test_protected_valid_token(client):
    token = create_access_token(
        data={"sub": "uid123", "email": "test@mymenu.com", "role": "consumer"},
        expires_delta=timedelta(minutes=15)
    )
    
    response = client.get(
        "/test-protected/user",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Access granted"
    assert data["user"]["sub"] == "uid123"

# Test 2: Token expirado
def test_protected_expired_token(client):
    # Pass a negative delta to immediately expire the token
    token = create_access_token(
        data={"sub": "uid123", "email": "test@mymenu.com", "role": "consumer"},
        expires_delta=timedelta(seconds=-5)
    )
    
    response = client.get(
        "/test-protected/user",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Token inválido ou expirado."

# Test 3: Token inexistente
def test_protected_no_token(client):
    response = client.get("/test-protected/user")
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Token inexistente."

# Test 4: Usuário sem permissão (Admin endpoint accessed by Consumer)
def test_protected_insufficient_permissions(client):
    # Create consumer token
    token = create_access_token(
        data={"sub": "uid123", "email": "test@mymenu.com", "role": "consumer"},
        expires_delta=timedelta(minutes=15)
    )
    
    # Try accessing admin-only endpoint
    response = client.get(
        "/test-protected/admin",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403
    assert response.json()["detail"] == "Usuário sem permissão."

# Test 5: Retorno HTTP correto (Admin endpoint accessed by Admin)
def test_protected_correct_http_response_admin(client):
    # Create admin token
    token = create_access_token(
        data={"sub": "uid128", "email": "admin@mymenu.com", "role": "admin"},
        expires_delta=timedelta(minutes=15)
    )
    
    response = client.get(
        "/test-protected/admin",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Admin access granted"
    assert data["user"]["role"] == "admin"


