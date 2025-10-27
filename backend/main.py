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
    response = requests.get(HISTORY_API_URL)
    data = response.json()
    rates = data["rates"]
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


if __name__ == "__main__":
    app.database = database_connection()
    uvicorn.run(app, host="0.0.0.0", port=8000)
else:
    app
