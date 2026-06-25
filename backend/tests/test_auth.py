import pytest
from unittest.mock import MagicMock, patch
from firebase_admin import auth as firebase_auth
from app.core.firebase_admin import get_auth, get_firestore

@pytest.fixture
def mock_register_services():
    with patch("app.routes.auth.get_auth") as mock_auth, \
         patch("app.routes.auth.get_firestore") as mock_firestore:
        
        auth_instance = MagicMock()
        mock_auth.return_value = auth_instance
        
        db_instance = MagicMock()
        mock_firestore.return_value = db_instance
        
        yield auth_instance, db_instance

@pytest.fixture
def mock_firebase_services():
    """Mocks Firebase auth and firestore functions"""
    with patch("app.routes.auth.get_auth") as mock_auth, \
         patch("app.routes.auth.get_firestore") as mock_firestore:
        
        # Setup mock Auth SDK
        auth_instance = MagicMock()
        mock_auth.return_value = auth_instance
        
        # Setup mock Firestore
        db_instance = MagicMock()
        mock_firestore.return_value = db_instance
        
        yield auth_instance, db_instance

# === Registration Tests ===

def test_register_consumer_success(client, mock_register_services):
    auth_instance, db_instance = mock_register_services
    
    # Mock firebase auth create_user
    user_record = MagicMock()
    user_record.uid = "uid456"
    auth_instance.create_user.return_value = user_record
    
    response = client.post(
        "/auth/register",
        json={
            "email": "newconsumer@test.com",
            "password": "TestPassword123!",
            "name": "New Consumer",
            "role": "consumer"
        }
    )
    
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "sucesso" in response.json()["message"].lower()
    
    # Verify set was called
    db_instance.collection.return_value.document.return_value.set.assert_called_once()

def test_register_duplicate_email(client, mock_register_services):
    auth_instance, db_instance = mock_register_services
    
    # Mock create_user raising EmailAlreadyExistsError
    auth_instance.create_user.side_effect = firebase_auth.EmailAlreadyExistsError("Email exists", None, None)
    
    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@test.com",
            "password": "TestPassword123!",
            "name": "Duplicate User",
            "role": "consumer"
        }
    )
    
    assert response.status_code == 400
    assert "email já está cadastrado" in response.json()["detail"].lower()


# === Login Tests ===

@patch("httpx.AsyncClient.post")
def test_login_success(mock_post, mock_firebase_services, client):
    auth_instance, db_instance = mock_firebase_services
    
    # 1. Mock HTTPX response for Firebase REST Auth (Success 200)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"idToken": "fake-firebase-token", "localId": "uid123"}
    mock_post.return_value = mock_resp
    
    # 2. Mock Firebase Admin Auth get_user_by_email
    user_record = MagicMock()
    user_record.uid = "uid123"
    auth_instance.get_user_by_email.return_value = user_record
    
    # 3. Mock Firestore Database fetch
    mock_snap = MagicMock()
    mock_snap.exists = True
    mock_snap.to_dict.return_value = {
        "email": "test@mymenu.com",
        "name": "Test User",
        "role": "consumer"
    }
    db_instance.collection.return_value.document.return_value.get.return_value = mock_snap
    
    response = client.post(
        "/auth/login",
        json={"email": "test@mymenu.com", "password": "password123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "test@mymenu.com"
    assert data["name"] == "Test User"
    assert data["role"] == "consumer"

@patch("httpx.AsyncClient.post")
def test_login_incorrect_password(mock_post, mock_firebase_services, client):
    # Mock HTTPX response showing 400 bad request (Invalid credentials)
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_post.return_value = mock_resp
    
    response = client.post(
        "/auth/login",
        json={"email": "test@mymenu.com", "password": "wrongpassword"}
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Email ou senha inválidos."

@patch("httpx.AsyncClient.post")
def test_login_user_not_found_in_db(mock_post, mock_firebase_services, client):
    auth_instance, db_instance = mock_firebase_services
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_post.return_value = mock_resp
    
    user_record = MagicMock()
    user_record.uid = "uid123"
    auth_instance.get_user_by_email.return_value = user_record
    
    # Mock Firestore document not existing
    mock_snap = MagicMock()
    mock_snap.exists = False
    db_instance.collection.return_value.document.return_value.get.return_value = mock_snap
    
    response = client.post(
        "/auth/login",
        json={"email": "test@mymenu.com", "password": "password123"}
    )
    
    assert response.status_code == 404
    assert "não encontrado no banco" in response.json()["detail"].lower()

def test_login_invalid_email_format(client):
    response = client.post(
        "/auth/login",
        json={"email": "invalid-email", "password": "password123"}
    )
    
    assert response.status_code == 422  # Pydantic validation error

@patch("httpx.AsyncClient.post")
def test_login_internal_server_error(mock_post, mock_firebase_services, client):
    # Simulate an unexpected exception in HTTPX Client
    mock_post.side_effect = Exception("Connection Timeout")
    
    response = client.post(
        "/auth/login",
        json={"email": "test@mymenu.com", "password": "password123"}
    )
    
    # In FastAPI, unhandled exceptions return 500 when raise_server_exceptions=False
    assert response.status_code == 500

@patch("httpx.AsyncClient.post")
def test_login_user_not_in_firebase_auth(mock_post, mock_firebase_services, client):
    auth_instance, db_instance = mock_firebase_services
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_post.return_value = mock_resp
    
    # get_user_by_email raises exception
    auth_instance.get_user_by_email.side_effect = Exception("User not found in Firebase Auth")
    
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@mymenu.com", "password": "password123"}
    )
    
    assert response.status_code == 500
    assert "Erro ao buscar usuário" in response.json()["detail"]

def test_login_missing_fields(client):
    response = client.post(
        "/auth/login",
        json={"email": "test@mymenu.com"} # Missing password
    )
    
    assert response.status_code == 422
