# Entry point para Vercel Serverless Functions
import sys
import os

# Importar el módulo main desde el directorio padre
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

# Exportar la app
handler = app
