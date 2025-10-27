from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

_MONGO_URI = os.getenv("MONGO_URI")
_MONGO_DB = os.getenv("MONGO_DB")
_HISTORY_COLLECTION = os.getenv("HISTORY_COLLECTION")
_HISTORY_API_URL = os.getenv("HISTORY_API_URL")


_database = None


def database_connection():
    try:
        global _database
        if _database is not None:
            return _database
        client = MongoClient(_MONGO_URI)
        db = client[_MONGO_DB]
        collection = db[_HISTORY_COLLECTION]
        _database = collection
        return _database
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None
