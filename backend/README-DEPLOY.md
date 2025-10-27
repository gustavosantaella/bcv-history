# Despliegue del Backend BCV en Vercel

Esta guía te ayudará a desplegar el backend de FastAPI en Vercel.

## Requisitos Previos

1. Cuenta en Vercel (https://vercel.com)
2. MongoDB Atlas o MongoDB alojado
3. Una URL de API para obtener datos históricos

## Configuración en Vercel

### 1. Instalar Vercel CLI (opcional pero recomendado)

```bash
npm i -g vercel
```

### 2. Login en Vercel

```bash
vercel login
```

### 3. Configurar Variables de Entorno

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables y agrega:

- `MONGO_URI`: URI de conexión a MongoDB
- `MONGO_DB`: Nombre de la base de datos
- `HISTORY_COLLECTION`: Nombre de la colección
- `HISTORY_API_URL`: URL de la API de datos históricos

**Nota:** Los nombres de las variables en `vercel.json` usan prefijos `@` para indicar que son secretos encriptados. En el dashboard, no incluyas el `@`.

### 4. Desplegar

#### Opción A: Desde la carpeta backend

```bash
cd backend
vercel
```

#### Opción B: Desde la raíz del proyecto

```bash
vercel --cwd backend
```

#### Opción C: Desde el Dashboard de Vercel

1. Conecta tu repositorio de GitHub
2. Configura el "Root Directory" como `backend`
3. Deploy automático

## Configuración de vercel.json

El archivo `vercel.json` incluye:

- **builds**: Usa el adaptador `@vercel/python` para ejecutar Python
- **routes**: Todas las rutas se redirigen a `main.py`
- **env**: Variables de entorno necesarias

## Estructura del Proyecto

```
backend/
├── main.py              # Aplicación FastAPI
├── db.py               # Conexión a MongoDB
├── vercel.json        # Configuración de Vercel
├── requirements.txt    # Dependencias Python
└── .vercelignore      # Archivos a ignorar
```

## Endpoints Disponibles

- `GET /`: Health check
- `GET /history`: Obtiene el historial de tasas de cambio

## Solución de Problemas

### Error: Module not found

Asegúrate de que todas las dependencias estén en `requirements.txt`:

```bash
pip freeze > requirements.txt
```

### Error: MongoDB connection

Verifica que:
1. Las variables de entorno estén correctamente configuradas en Vercel
2. La IP de Vercel esté en la lista blanca de MongoDB Atlas
3. La URI de conexión sea correcta

### Error: Environment variables

Los archivos `.env` locales no funcionan en Vercel. Usa el dashboard o CLI:

```bash
vercel env add MONGO_URI
```

## Desarrollo Local

Para probar localmente antes de desplegar:

```bash
cd backend
python -m uvicorn main:app --reload
```

La API estará disponible en `http://localhost:8000`

## Verificación

Después del despliegue:

1. Visita `https://tu-proyecto.vercel.app/` - Debe mostrar `{"message": "BCV API", "status": "online"}`
2. Visita `https://tu-proyecto.vercel.app/history` - Debe mostrar datos JSON

## Archivos Importantes

- `vercel.json`: Configuración del servidorless function
- `.vercelignore`: Excluye archivos innecesarios del deployment
- `requirements.txt`: Todas las dependencias Python necesarias
- `main.py`: Punto de entrada de la aplicación

## Soporte

Para más información: [Vercel Documentation](https://vercel.com/docs)

