import pytest
from fastapi.testclient import TestClient
from app.core.database import Database
from main import app

@pytest.fixture
def client():
    """Fixture for FastAPI test client"""
    # Mock database for testing
    Database.connect_to_mongo()
    
    with TestClient(app) as test_client:
        yield test_client
    
    Database.close_mongo_connection()
