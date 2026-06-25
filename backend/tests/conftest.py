import os
from unittest.mock import MagicMock, patch

# Set environment variables for testing BEFORE any other imports (so Settings can load them)
tests_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["FIREBASE_SERVICE_ACCOUNT"] = os.path.join(tests_dir, "dummy-firebase.json")
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-security"
os.environ["FIREBASE_API_KEY"] = "test-api-key"
os.environ["SMTP_USER"] = "test-smtp-user@mymenu.com"
os.environ["SMTP_PASSWORD"] = "test-smtp-password"

import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(autouse=True)
def mock_firebase_init():
    """Mock firebase credentials certificate parsing and admin app initialization"""
    with patch("firebase_admin.credentials.Certificate") as mock_cert, \
         patch("firebase_admin.initialize_app") as mock_init:
        yield mock_init

@pytest.fixture
def client():
    """Fixture for FastAPI test client without MongoDB/Firebase file dependencies"""
    with patch("app.core.firebase_admin.get_firebase_app") as mock_app:
        with TestClient(app, raise_server_exceptions=False) as test_client:
            yield test_client
