import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

_app = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_firebase_app():
    global _app
    if _app is None:
        service_account_path = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT",
            os.path.join(BASE_DIR, "firebase-service-account.json")
        )
        if not os.path.exists(service_account_path):
            raise FileNotFoundError(f"Service account n\u00e3o encontrado em: {service_account_path}")
        cred = credentials.Certificate(service_account_path)
        _app = firebase_admin.initialize_app(cred)
    return _app

def get_auth():
    get_firebase_app()
    return auth

def get_firestore():
    get_firebase_app()
    return firestore.client()
