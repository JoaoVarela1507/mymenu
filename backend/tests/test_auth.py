import pytest
from fastapi.testclient import TestClient
from app.core.security import hash_password, verify_password

# Test password hashing
def test_password_hashing():
    password = "testpassword123"
    hashed = hash_password(password)
    
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

# Test successful registration
def test_register_consumer(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "consumer@test.com",
            "password": "TestPassword123!",
            "name": "Test Consumer",
            "role": "consumer"
        }
    )
    assert response.status_code == 201
    assert "success" in response.json()
    assert response.json()["success"] is True

# Test invalid role
def test_register_invalid_role(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "user@test.com",
            "password": "TestPassword123!",
            "name": "Test User",
            "role": "invalid"
        }
    )
    assert response.status_code == 400

# Test duplicate email
def test_register_duplicate_email(client: TestClient):
    # First registration
    client.post(
        "/auth/register",
        json={
            "email": "duplicate@test.com",
            "password": "TestPassword123!",
            "name": "First User",
            "role": "consumer"
        }
    )
    
    # Second registration with same email
    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@test.com",
            "password": "DifferentPassword123!",
            "name": "Second User",
            "role": "admin"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]
