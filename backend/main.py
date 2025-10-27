from typing import Union
import uvicorn
from fastapi import FastAPI, Response
from db import database_connection
from os import getenv
import requests
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


HISTORY_API_URL = getenv("HISTORY_API_URL")
app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inicializar base de datos al arrancar
@app.on_event("startup")
async def startup_event():
    app.database = database_connection()


def _get_variation(today, yesterday):
    today = float(today)
    yesterday = float(yesterday)
    return ((today - yesterday) / yesterday) * 100


def _already_exists_by_date(date: str):
    collection = app.database
    return collection.find_one({"date": date.strip()}, {"_id": 0})


@app.get("/")
def read_root():
    return {"message": "BCV API", "status": "online"}


@app.get("/history")
def history():
    try:
        # Verificar si HISTORY_API_URL está configurado
        if not HISTORY_API_URL:
            return {
                "message": "HISTORY_API_URL no está configurado",
                "status": "error",
                "error": "Variable de entorno HISTORY_API_URL no encontrada",
            }

        print(f"Requesting data from: {HISTORY_API_URL}")
        response = requests.get(HISTORY_API_URL, timeout=10)

        # Verificar status code
        if response.status_code != 200:
            return {
                "message": "Error al obtener los datos de la API",
                "status": "error",
                "error": f"Status code: {response.status_code}, Response: {response.text[:200]}",
            }

        # Verificar que la respuesta no esté vacía
        if not response.text:
            return {
                "message": "Respuesta vacía de la API",
                "status": "error",
                "error": "La API retornó una respuesta vacía",
            }

        # Intentar parsear JSON con mejor manejo de errores
        try:
            data = response.json()
        except ValueError as json_error:
            return {
                "message": "Error al parsear JSON",
                "status": "error",
                "error": f"JSON error: {str(json_error)}, Response: {response.text[:200]}",
            }

        # Verificar que tiene la estructura esperada
        if "rates" not in data:
            return {
                "message": "Estructura de datos incorrecta",
                "status": "error",
                "error": f"Respuesta no contiene 'rates': {data}",
            }

        rates = data["rates"]

        if len(rates) < 2:
            return {
                "message": "No hay suficientes datos en la respuesta",
                "status": "error",
                "error": f"Solo se encontraron {len(rates)} registros, se necesitan al menos 2",
            }

        today = rates[0]
        yesterday = rates[1]
        dollar = today["dollar"]
        collection = app.database

        date_value = today["date"]
        if isinstance(date_value, str):
            date_obj = datetime.strptime(date_value, "%Y-%m-%d")
        else:
            date_obj = date_value
        date = date_obj.strftime("%d/%m/%Y")
        variation = _get_variation(today["dollar"], yesterday["dollar"])
        data_to_insert = {
            "dollar": dollar,
            "date": date,
            "variation": variation,
        }
        if _already_exists_by_date(date) is None:
            print("Inserting data...")
            collection.insert_one(data_to_insert)

        return list(collection.find({}, {"_id": 0}))

    except requests.exceptions.RequestException as req_error:
        return {
            "message": "Error de conexión",
            "status": "error",
            "error": f"Request error: {str(req_error)}",
        }
    except KeyError as key_error:
        return {
            "message": "Error en la estructura de datos",
            "status": "error",
            "error": f"Key error: {str(key_error)}",
        }
    except Exception as e:
        import traceback

        print(f"Unexpected error: {traceback.format_exc()}")
        return {
            "message": "Error al obtener los datos",
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()[:500],
        }


if __name__ == "__main__":
    app.database = database_connection()
    uvicorn.run(app, host="0.0.0.0", port=8000)
else:
    app.database = database_connection()

    app
