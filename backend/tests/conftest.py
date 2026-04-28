from copy import deepcopy

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.core import files as files_module
from app.core.database import Database
from main import app


class FakeInsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class FakeUpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class FakeCollection:
    def __init__(self):
        self.documents = []

    def _matches(self, document, query):
        for key, value in query.items():
            if isinstance(value, dict):
                if "$ne" in value and document.get(key) == value["$ne"]:
                    return False
                continue
            if document.get(key) != value:
                return False
        return True

    def find_one(self, query):
        for document in self.documents:
            if self._matches(document, query):
                return deepcopy(document)
        return None

    def find(self, query):
        return [deepcopy(document) for document in self.documents if self._matches(document, query)]

    def insert_one(self, document):
        stored = deepcopy(document)
        if stored.get("_id") is None:
            stored["_id"] = ObjectId()
        self.documents.append(stored)
        return FakeInsertOneResult(stored["_id"])

    def update_one(self, query, update):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                stored = deepcopy(document)
                for key, value in update.get("$set", {}).items():
                    stored[key] = value
                self.documents[index] = stored
                return FakeUpdateResult(1)
        return FakeUpdateResult(0)

    def delete_many(self, query):
        kept = [document for document in self.documents if not self._matches(document, query)]
        deleted = len(self.documents) - len(kept)
        self.documents = kept
        return FakeDeleteResult(deleted)

    def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                del self.documents[index]
                return FakeDeleteResult(1)
        return FakeDeleteResult(0)

    def count_documents(self, query):
        return len([document for document in self.documents if self._matches(document, query)])

    def create_index(self, *args, **kwargs):
        return None


class FakeDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = FakeCollection()
        return self.collections[name]


@pytest.fixture
def fake_db(tmp_path, monkeypatch):
    database = FakeDatabase()
    uploads_dir = tmp_path / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    def connect():
        Database.db = database

    def close():
        Database.db = None

    monkeypatch.setattr(Database, "connect_to_mongo", staticmethod(connect))
    monkeypatch.setattr(Database, "close_mongo_connection", staticmethod(close))
    monkeypatch.setattr(files_module, "UPLOADS_DIR", uploads_dir)

    Database.db = database
    return database


@pytest.fixture
def client(fake_db):
    with TestClient(app) as test_client:
        yield test_client


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}
