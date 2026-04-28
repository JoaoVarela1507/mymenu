from app.core.security import hash_password, verify_password


def register_restaurant(client, email="admin@restaurante.com", cnpj="12.345.678/0001-00"):
    response = client.post(
        "/auth/register-restaurant",
        data={
            "restaurant_name": "Pizzaria Bella",
            "cnpj": cnpj,
            "phone": "(11) 99999-9999",
            "address": "Rua Central, 123",
            "category": "Pizza",
            "name": "Admin Bella",
            "email": email,
            "password": "TestPassword123!",
        },
        files={"document_file": ("documento.pdf", b"fake-pdf-content", "application/pdf")},
    )
    return response


def test_password_hashing():
    password = "testpassword123"
    hashed = hash_password(password)

    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_register_consumer(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "consumer@test.com",
            "password": "TestPassword123!",
            "name": "Test Consumer",
            "role": "consumer",
        },
    )
    assert response.status_code == 201
    assert response.json()["success"] is True


def test_register_invalid_role(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "user@test.com",
            "password": "TestPassword123!",
            "name": "Test User",
            "role": "invalid",
        },
    )
    assert response.status_code == 400


def test_register_duplicate_email(client):
    client.post(
        "/auth/register",
        json={
            "email": "duplicate@test.com",
            "password": "TestPassword123!",
            "name": "First User",
            "role": "consumer",
        },
    )

    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@test.com",
            "password": "DifferentPassword123!",
            "name": "Second User",
            "role": "admin",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_restaurant_creates_restaurant_and_admin(client):
    response = register_restaurant(client)

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["restaurant_id"]
    assert body["user_id"]


def test_login_admin_returns_restaurant_id(client):
    register_restaurant(client, email="owner@test.com", cnpj="98.765.432/0001-99")

    response = client.post(
        "/auth/login",
        json={"email": "owner@test.com", "password": "TestPassword123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "admin"
    assert body["restaurant_id"]
    assert body["access_token"]
