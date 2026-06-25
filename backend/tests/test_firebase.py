import pytest
from unittest.mock import MagicMock, patch
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

# Setup helper to get a mocked Firestore client
def get_mock_db():
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_document = MagicMock()
    mock_snapshot = MagicMock()
    
    mock_db.collection.return_value = mock_collection
    mock_collection.document.return_value = mock_document
    mock_document.get.return_value = mock_snapshot
    
    return mock_db, mock_collection, mock_document, mock_snapshot

# Test 1: Leitura (Read)
def test_firestore_read_success():
    mock_db, _, _, mock_snap = get_mock_db()
    mock_snap.exists = True
    mock_snap.to_dict.return_value = {"name": "Burger Joint", "category": "Burgers"}
    
    with patch("app.core.firebase_admin.get_firestore", return_value=mock_db):
        from app.core.firebase_admin import get_firestore
        db = get_firestore()
        doc = db.collection("restaurants").document("rest123").get()
        
        assert doc.exists is True
        assert doc.to_dict()["name"] == "Burger Joint"
        mock_db.collection.assert_called_with("restaurants")

# Test 2: Escrita (Write)
def test_firestore_write_success():
    mock_db, _, mock_doc, _ = get_mock_db()
    
    with patch("app.core.firebase_admin.get_firestore", return_value=mock_db):
        from app.core.firebase_admin import get_firestore
        db = get_firestore()
        data = {"email": "user@test.com", "role": "consumer"}
        db.collection("users").document("user123").set(data)
        
        mock_doc.set.assert_called_with(data)

# Test 3: Atualização (Update)
def test_firestore_update_success():
    mock_db, _, mock_doc, _ = get_mock_db()
    
    with patch("app.core.firebase_admin.get_firestore", return_value=mock_db):
        from app.core.firebase_admin import get_firestore
        db = get_firestore()
        update_data = {"phone": "123456789"}
        db.collection("users").document("user123").update(update_data)
        
        mock_doc.update.assert_called_with(update_data)

# Test 4: Exclusão (Delete)
def test_firestore_delete_success():
    mock_db, _, mock_doc, _ = get_mock_db()
    
    with patch("app.core.firebase_admin.get_firestore", return_value=mock_db):
        from app.core.firebase_admin import get_firestore
        db = get_firestore()
        db.collection("users").document("user123").delete()
        
        mock_doc.delete.assert_called_once()

# Test 5: Falha de conexão
def test_firestore_connection_failure():
    mock_db = MagicMock()
    mock_db.collection.side_effect = Exception("Failed to connect to firestore gRPC endpoint")
    
    with patch("app.core.firebase_admin.get_firestore", return_value=mock_db):
        from app.core.firebase_admin import get_firestore
        db = get_firestore()
        
        with pytest.raises(Exception) as exc_info:
            db.collection("users").document("user123").get()
        
        assert "Failed to connect" in str(exc_info.value)

# Test 8: Registro de restaurante composto no Firestore
def test_restaurant_composite_registration(client):
    """Verifica se o endpoint de registro de restaurante grava dados nas duas coleções: users e userRestaurant"""
    with patch("app.routes.restaurant.get_auth") as mock_auth, \
         patch("app.routes.restaurant.get_firestore") as mock_firestore:
        
        # Setup mocks
        auth_instance = MagicMock()
        mock_auth.return_value = auth_instance
        
        db_instance = MagicMock()
        mock_firestore.return_value = db_instance
        
        # Simulate user already exists in Auth SDK
        existing_user = MagicMock()
        existing_user.uid = "uid_existing"
        auth_instance.get_user_by_email.return_value = existing_user
        
        # Mock users and userRestaurant documents
        mock_user_doc = MagicMock()
        mock_user_doc.exists = True
        
        # Mock restaurant doc not existing
        mock_rest_doc = MagicMock()
        mock_rest_doc.get.return_value.exists = False
        
        def doc_side_effect(uid):
            if uid == "uid_existing":
                return mock_rest_doc
            return MagicMock()
            
        db_instance.collection.return_value.document.side_effect = doc_side_effect
        
        payload = {
            "email": "restaurant_owner@test.com",
            "name": "Owner Name",
            "phone": "99999999",
            "restaurant_name": "Gourmet Place",
            "cnpj": "12.345.678/0001-99",
            "restaurant_phone": "88888888",
            "category": "Italian",
            "address": "123 Main St",
            "city": "São Paulo",
            "state": "SP",
            "cep": "01001-000",
            "description": "Tasty food"
        }
        
        response = client.post("/restaurant/register", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "vinc" in data["message"].lower() or "sucesso" in data["message"].lower()
        
        # Verify db.collection("users").document("uid_existing").set and db.collection("userRestaurant").document("uid_existing").set were called
        db_instance.collection.assert_any_call("users")
        db_instance.collection.assert_any_call("userRestaurant")
