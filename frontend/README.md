# BCV Frontend

Aplicación Angular con Tailwind CSS para mostrar las tasas de cambio del Banco Central de Venezuela.

## Características

- ✅ Angular 17 con componentes standalone
- ✅ Tailwind CSS para estilos modernos
- ✅ Soporte para múltiples entornos (development, local, production)
- ✅ Diseño responsive
- ✅ Consumo de API REST
- ✅ Gráficas interactivas (Chart.js):
  - Evolución del precio del dólar (línea temporal)
  - Variación diaria (gráfica de barras con colores por positivo/negativo)
  - Distribución de registros por año (gráfica de pie)
  - Tendencia por mes (gráfica radar)
- ✅ Paginación (20 registros por página)
- ✅ Filtros por rango de fechas
- ✅ Ordenamiento automático (más reciente primero)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

**Nota:** Si aparece un error relacionado con `chart.js` o `ng2-charts`, ejecuta:
```bash
npm install chart.js@^4.4.0 ng2-charts@^6.0.0
```

## Desarrollo

### Ejecutar en modo desarrollo
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Ejecutar en modo local
```bash
ng serve --configuration=local
```

### Ejecutar en modo producción
```bash
ng serve --configuration=production
```

## Entornos

La aplicación soporta tres entornos:

- **development**: `environment.development.ts` - URL: `http://localhost:8000`
- **local**: `environment.local.ts` - URL: `http://localhost:8000`
- **production**: `environment.production.ts` - URL: `https://api.production.com`

Puedes editar las URLs en los archivos correspondientes en `src/environments/`.

## Estructura del Proyecto

```
src/
├── app/
│   ├── models/
│   │   └── rate.model.ts          # Modelo de datos
│   ├── services/
│   │   └── api.service.ts          # Servicio HTTP
│   ├── app.component.ts            # Componente principal
│   ├── app.component.html          # Template
│   └── app.component.css           # Estilos
├── environments/
│   ├── environment.ts             # Entorno por defecto
│   ├── environment.development.ts  # Desarrollo
│   ├── environment.local.ts        # Local
│   └── environment.production.ts  # Producción
├── index.html
├── main.ts
└── styles.css
```

## API

La aplicación consume el endpoint:
- GET `http://localhost:8000/history`

Estructura de respuesta esperada:
```json
[
  {
    "date": "24/10/2025",
    "dollar": "216.1009",
    "variation": "0.91"
  }
]
```

## Build

Para construir la aplicación para producción:

```bash
npm run build
```

El build de producción se generará en la carpeta `dist/bcv-frontend`.

## Tecnologías

- Angular 17
- Tailwind CSS 3
- RxJS
- TypeScript 5

