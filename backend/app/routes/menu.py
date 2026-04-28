import json
from datetime import datetime
from json import JSONDecodeError

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.core.database import db
from app.core.files import delete_upload_file, save_upload_file
from app.core.serialization import serialize_document
from app.dependencies.auth import get_current_admin
from app.models.menu_category import MenuCategory
from app.models.menu_item import MenuItem
from app.schemas.menu import MenuCategoryRequest


router = APIRouter(prefix="/menu", tags=["Menu"])
ALLOWED_ALLERGENS = {"gluten", "dairy", "eggs", "nuts", "soy", "fish", "shellfish"}


def parse_object_id(value: str, detail: str):
    try:
        return ObjectId(value)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail) from exc


def normalize_category_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def validate_prices(mymenu: float, ifood: float, ubereats: float, rappi: float) -> dict:
    prices = {
        "mymenu": mymenu,
        "ifood": ifood,
        "ubereats": ubereats,
        "rappi": rappi,
    }
    for platform, value in prices.items():
        if value < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{platform} price must be greater than or equal to zero",
            )
    return prices


def validate_menu_payload(
    name: str,
    prices: dict,
    is_offer: bool,
    offer_price: float | None,
    exclusive: str | None,
    allergens: list[str],
):
    if not name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item name is required",
        )

    if prices["mymenu"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MyMenu price must be greater than zero",
        )

    if exclusive not in (None, "", "delivery", "presencial"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid exclusive value",
        )

    invalid_allergens = [item for item in allergens if item not in ALLOWED_ALLERGENS]
    if invalid_allergens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid allergens: {', '.join(invalid_allergens)}",
        )

    if is_offer:
        if offer_price is None or offer_price <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer price must be greater than zero when the item is on offer",
            )
        if offer_price >= prices["mymenu"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer price must be lower than the MyMenu price",
            )


def get_category_for_restaurant(category_id: ObjectId, restaurant_id: ObjectId):
    category = db.get_db()["menu_categories"].find_one(
        {"_id": category_id, "restaurant_id": restaurant_id}
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found for this restaurant",
        )
    return category


@router.get("/categories")
async def list_categories(current_admin=Depends(get_current_admin)):
    # Return mock data if database is not available
    if db.get_db() is None:
        return [
            {
                "_id": "mock-cat-1",
                "name": "Pizzas",
                "order": 1,
                "restaurant_id": "mock-restaurant-1",
            },
            {
                "_id": "mock-cat-2",
                "name": "Bebidas",
                "order": 2,
                "restaurant_id": "mock-restaurant-1",
            },
            {
                "_id": "mock-cat-3",
                "name": "Sobremesas",
                "order": 3,
                "restaurant_id": "mock-restaurant-1",
            },
        ]
    
    restaurant_id = current_admin["restaurant_id"]
    categories = list(db.get_db()["menu_categories"].find({"restaurant_id": restaurant_id}))
    categories.sort(key=lambda item: (item.get("order", 0), item.get("name", "")))
    return [serialize_document(item) for item in categories]


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    request: MenuCategoryRequest,
    current_admin=Depends(get_current_admin),
):
    restaurant_id = current_admin["restaurant_id"]
    categories_collection = db.get_db()["menu_categories"]
    normalized_name = normalize_category_name(request.name)

    existing = categories_collection.find_one(
        {"restaurant_id": restaurant_id, "normalized_name": normalized_name}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists for this restaurant",
        )

    category = MenuCategory(
        restaurant_id=restaurant_id,
        name=request.name.strip(),
        order=request.order,
        normalized_name=normalized_name,
    )
    result = categories_collection.insert_one(category.to_dict())
    created = categories_collection.find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    request: MenuCategoryRequest,
    current_admin=Depends(get_current_admin),
):
    restaurant_id = current_admin["restaurant_id"]
    category_object_id = parse_object_id(category_id, "Invalid category id")
    categories_collection = db.get_db()["menu_categories"]
    existing = categories_collection.find_one(
        {"_id": category_object_id, "restaurant_id": restaurant_id}
    )
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    normalized_name = normalize_category_name(request.name)
    duplicate = categories_collection.find_one(
        {"restaurant_id": restaurant_id, "normalized_name": normalized_name}
    )
    if duplicate and duplicate["_id"] != category_object_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists for this restaurant",
        )

    categories_collection.update_one(
        {"_id": category_object_id},
        {
            "$set": {
                "name": request.name.strip(),
                "order": request.order,
                "normalized_name": normalized_name,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    updated = categories_collection.find_one({"_id": category_object_id})
    return serialize_document(updated)


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_admin=Depends(get_current_admin)):
    restaurant_id = current_admin["restaurant_id"]
    category_object_id = parse_object_id(category_id, "Invalid category id")
    categories_collection = db.get_db()["menu_categories"]
    existing = categories_collection.find_one(
        {"_id": category_object_id, "restaurant_id": restaurant_id}
    )
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    items_count = db.get_db()["menu_items"].count_documents(
        {"restaurant_id": restaurant_id, "category_id": category_object_id}
    )
    if items_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a category that still has menu items",
        )

    categories_collection.delete_one({"_id": category_object_id})
    return {"success": True, "message": "Category deleted successfully"}


@router.get("/items")
async def list_items(current_admin=Depends(get_current_admin)):
    # Return mock data if database is not available
    if db.get_db() is None:
        return [
            {
                "_id": "mock-item-1",
                "name": "Pizza Margherita",
                "description": "Pizza clássica com tomate, mozzarela e manjericão",
                "category_id": "mock-cat-1",
                "restaurant_id": "mock-restaurant-1",
                "prices": {
                    "mymenu": 35.90,
                    "ifood": 39.90,
                    "ubereats": 39.90,
                    "rappi": 38.90,
                },
                "available": True,
                "allergens": ["gluten", "dairy"],
                "is_offer": False,
            },
            {
                "_id": "mock-item-2",
                "name": "Pizza Pepperoni",
                "description": "Pizza com pepperoni e queijo derretido",
                "category_id": "mock-cat-1",
                "restaurant_id": "mock-restaurant-1",
                "prices": {
                    "mymenu": 42.90,
                    "ifood": 46.90,
                    "ubereats": 46.90,
                    "rappi": 45.90,
                },
                "available": True,
                "allergens": ["gluten", "dairy"],
                "is_offer": True,
                "offer_price": 35.90,
            },
            {
                "_id": "mock-item-3",
                "name": "Coca-Cola 1L",
                "description": "Bebida gelada 1 litro",
                "category_id": "mock-cat-2",
                "restaurant_id": "mock-restaurant-1",
                "prices": {
                    "mymenu": 8.90,
                    "ifood": 9.90,
                    "ubereats": 9.90,
                    "rappi": 9.90,
                },
                "available": True,
                "allergens": [],
                "is_offer": False,
            },
        ]
    
    restaurant_id = current_admin["restaurant_id"]
    items = list(db.get_db()["menu_items"].find({"restaurant_id": restaurant_id}))
    items.sort(key=lambda item: item.get("name", ""))
    return [serialize_document(item) for item in items]


@router.get("/items/{item_id}")
async def get_item(item_id: str, current_admin=Depends(get_current_admin)):
    restaurant_id = current_admin["restaurant_id"]
    item_object_id = parse_object_id(item_id, "Invalid item id")
    item = db.get_db()["menu_items"].find_one(
        {"_id": item_object_id, "restaurant_id": restaurant_id}
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return serialize_document(item)


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(
    category_id: str = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    ingredients: str | None = Form(None),
    price_mymenu: float = Form(...),
    price_ifood: float = Form(0),
    price_ubereats: float = Form(0),
    price_rappi: float = Form(0),
    available: bool = Form(True),
    exclusive: str | None = Form(None),
    allergens: str = Form("[]"),
    is_offer: bool = Form(False),
    offer_price: float | None = Form(None),
    image: UploadFile | None = File(None),
    current_admin=Depends(get_current_admin),
):
    restaurant_id = current_admin["restaurant_id"]
    category_object_id = parse_object_id(category_id, "Invalid category id")
    get_category_for_restaurant(category_object_id, restaurant_id)

    try:
        parsed_allergens = json.loads(allergens or "[]")
    except JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Allergens must be valid JSON",
        ) from exc
    if not isinstance(parsed_allergens, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Allergens must be a list",
        )

    prices = validate_prices(price_mymenu, price_ifood, price_ubereats, price_rappi)
    validate_menu_payload(name, prices, is_offer, offer_price, exclusive or None, parsed_allergens)

    image_url = None
    if image is not None and image.filename:
        image_url = await save_upload_file(image, "menu-items", {".jpg", ".jpeg", ".png", ".webp"})

    item = MenuItem(
        restaurant_id=restaurant_id,
        category_id=category_object_id,
        name=name.strip(),
        description=description.strip() if description else None,
        ingredients=ingredients.strip() if ingredients else None,
        image_url=image_url,
        prices=prices,
        available=available,
        exclusive=exclusive or None,
        allergens=parsed_allergens,
        is_offer=is_offer,
        offer_price=offer_price if is_offer else None,
    )
    result = db.get_db()["menu_items"].insert_one(item.to_dict())
    created = db.get_db()["menu_items"].find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.put("/items/{item_id}")
async def update_item(
    item_id: str,
    category_id: str = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    ingredients: str | None = Form(None),
    price_mymenu: float = Form(...),
    price_ifood: float = Form(0),
    price_ubereats: float = Form(0),
    price_rappi: float = Form(0),
    available: bool = Form(True),
    exclusive: str | None = Form(None),
    allergens: str = Form("[]"),
    is_offer: bool = Form(False),
    offer_price: float | None = Form(None),
    image: UploadFile | None = File(None),
    current_admin=Depends(get_current_admin),
):
    restaurant_id = current_admin["restaurant_id"]
    item_object_id = parse_object_id(item_id, "Invalid item id")
    category_object_id = parse_object_id(category_id, "Invalid category id")
    get_category_for_restaurant(category_object_id, restaurant_id)

    items_collection = db.get_db()["menu_items"]
    existing = items_collection.find_one({"_id": item_object_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    try:
        parsed_allergens = json.loads(allergens or "[]")
    except JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Allergens must be valid JSON",
        ) from exc
    if not isinstance(parsed_allergens, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Allergens must be a list",
        )

    prices = validate_prices(price_mymenu, price_ifood, price_ubereats, price_rappi)
    validate_menu_payload(name, prices, is_offer, offer_price, exclusive or None, parsed_allergens)

    image_url = existing.get("image_url")
    if image is not None and image.filename:
        new_image_url = await save_upload_file(image, "menu-items", {".jpg", ".jpeg", ".png", ".webp"})
        delete_upload_file(image_url)
        image_url = new_image_url

    items_collection.update_one(
        {"_id": item_object_id},
        {
            "$set": {
                "category_id": category_object_id,
                "name": name.strip(),
                "description": description.strip() if description else None,
                "ingredients": ingredients.strip() if ingredients else None,
                "image_url": image_url,
                "prices": prices,
                "available": available,
                "exclusive": exclusive or None,
                "allergens": parsed_allergens,
                "is_offer": is_offer,
                "offer_price": offer_price if is_offer else None,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    updated = items_collection.find_one({"_id": item_object_id})
    return serialize_document(updated)


@router.delete("/items/{item_id}")
async def delete_item(item_id: str, current_admin=Depends(get_current_admin)):
    restaurant_id = current_admin["restaurant_id"]
    item_object_id = parse_object_id(item_id, "Invalid item id")
    items_collection = db.get_db()["menu_items"]
    existing = items_collection.find_one({"_id": item_object_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    delete_upload_file(existing.get("image_url"))
    items_collection.delete_one({"_id": item_object_id})
    return {"success": True, "message": "Menu item deleted successfully"}
