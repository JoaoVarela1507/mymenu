def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def register_restaurant(client, email, cnpj, name):
    register_response = client.post(
        "/auth/register-restaurant",
        data={
            "restaurant_name": name,
            "cnpj": cnpj,
            "phone": "(11) 99999-9999",
            "address": "Rua Principal, 100",
            "category": "Pizza",
            "name": f"Admin {name}",
            "email": email,
            "password": "TestPassword123!",
        },
        files={"document_file": ("documento.pdf", b"fake-pdf-content", "application/pdf")},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": email, "password": "TestPassword123!"},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def create_category(client, token, name="Pizzas", order=1):
    response = client.post(
        "/menu/categories",
        headers=auth_headers(token),
        json={"name": name, "order": order},
    )
    assert response.status_code == 201
    return response.json()


def create_item(client, token, category_id, image_name="pizza.png", image_content=b"fake-image"):
    response = client.post(
        "/menu/items",
        headers=auth_headers(token),
        data={
            "category_id": category_id,
            "name": "Pizza Margherita",
            "description": "Clássica",
            "ingredients": "Tomate, queijo e manjericão",
            "price_mymenu": "32.90",
            "price_ifood": "35.90",
            "price_ubereats": "34.90",
            "price_rappi": "34.90",
            "available": "true",
            "exclusive": "",
            "allergens": '["gluten","dairy"]',
            "is_offer": "true",
            "offer_price": "29.90",
        },
        files={"image": (image_name, image_content, "image/png")},
    )
    assert response.status_code == 201
    return response.json()


def test_menu_requires_authentication(client):
    response = client.get("/menu/items")
    assert response.status_code == 401


def test_consumer_cannot_access_menu_crud(client):
    client.post(
        "/auth/register",
        json={
            "email": "consumer@menu.com",
            "password": "TestPassword123!",
            "name": "Consumer",
            "role": "consumer",
        },
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "consumer@menu.com", "password": "TestPassword123!"},
    )

    response = client.get("/menu/categories", headers=auth_headers(login_response.json()["access_token"]))
    assert response.status_code == 403


def test_create_list_update_delete_category(client):
    token = register_restaurant(client, "cat-admin@test.com", "11.111.111/0001-11", "Bella Cat")
    category = create_category(client, token, "Pizzas", 1)

    list_response = client.get("/menu/categories", headers=auth_headers(token))
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = client.put(
        f"/menu/categories/{category['id']}",
        headers=auth_headers(token),
        json={"name": "Pizzas Premium", "order": 2},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Pizzas Premium"

    delete_response = client.delete(
        f"/menu/categories/{category['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 200


def test_cannot_delete_category_with_items(client):
    token = register_restaurant(client, "block-admin@test.com", "22.222.222/0001-22", "Bella Block")
    category = create_category(client, token)
    create_item(client, token, category["id"])

    delete_response = client.delete(
        f"/menu/categories/{category['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 400
    assert "Cannot delete a category" in delete_response.json()["detail"]


def test_create_update_delete_item_with_image(client):
    token = register_restaurant(client, "item-admin@test.com", "33.333.333/0001-33", "Bella Item")
    category = create_category(client, token)
    created_item = create_item(client, token, category["id"], image_content=b"image-v1")

    assert created_item["image_url"]
    assert created_item["is_offer"] is True

    update_response = client.put(
        f"/menu/items/{created_item['id']}",
        headers=auth_headers(token),
        data={
            "category_id": category["id"],
            "name": "Pizza Quatro Queijos",
            "description": "Nova descrição",
            "ingredients": "Queijos especiais",
            "price_mymenu": "42.90",
            "price_ifood": "45.90",
            "price_ubereats": "44.90",
            "price_rappi": "44.90",
            "available": "false",
            "exclusive": "delivery",
            "allergens": '["dairy"]',
            "is_offer": "false",
            "offer_price": "",
        },
        files={"image": ("nova.png", b"image-v2", "image/png")},
    )
    assert update_response.status_code == 200
    updated_item = update_response.json()
    assert updated_item["name"] == "Pizza Quatro Queijos"
    assert updated_item["available"] is False
    assert updated_item["exclusive"] == "delivery"
    assert updated_item["is_offer"] is False

    get_response = client.get(f"/menu/items/{created_item['id']}", headers=auth_headers(token))
    assert get_response.status_code == 200

    delete_response = client.delete(
        f"/menu/items/{created_item['id']}",
        headers=auth_headers(token),
    )
    assert delete_response.status_code == 200

    list_response = client.get("/menu/items", headers=auth_headers(token))
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_restaurant_cannot_access_another_restaurant_item(client):
    token_a = register_restaurant(client, "rest-a@test.com", "44.444.444/0001-44", "Bella A")
    token_b = register_restaurant(client, "rest-b@test.com", "55.555.555/0001-55", "Bella B")

    category_a = create_category(client, token_a, "Pizzas A", 1)
    item_a = create_item(client, token_a, category_a["id"])

    response = client.get(f"/menu/items/{item_a['id']}", headers=auth_headers(token_b))
    assert response.status_code == 404
