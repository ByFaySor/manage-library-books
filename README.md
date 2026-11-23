# Biblioteca de libros

Aplicación para gestionar una biblioteca de libros: listar, crear, editar, eliminar y filtrar libros por categoría.

- **Backend:** Laravel 13 como **API JSON** (`/api/v1`), sin vistas ni Inertia.
- **Frontend:** SPA independiente con **React 19 + TypeScript + Vite + Tailwind CSS 4** (`frontend/`).
- **Base de datos:** **PostgreSQL 18**.
- **Infraestructura:** `docker-compose.yml` con `db`, `api` (PHP-FPM), `web` (Nginx) y `frontend` (Nginx sirviendo la SPA).

---

## 1. Arranque rápido con Docker

Requisitos: Docker Desktop con `docker compose` (v2 o superior).

```bash
# 1. Variables de entorno del compose (puertos, credenciales, APP_KEY)
cp .env.docker .env

# 2. Construir y levantar todos los servicios
docker compose up --build
```

| Servicio | URL | Descripción |
|---|---|---|
| SPA | http://localhost:3000 | Frontend React (proxy `/api` incluido) |
| API | http://localhost:8000/api/v1/books | API JSON |
| Health | http://localhost:8000/up | Estado de la aplicación |
| PostgreSQL | interno (servicio `db`) | No expone puerto al host |

Al arrancar, el contenedor `api` espera a que PostgreSQL acepte conexiones, ejecuta las migraciones y carga los datos de ejemplo (6 categorías y 24 libros).

Para detener:

```bash
docker compose down          # mantiene los datos (volumen pgdata)
docker compose down -v       # elimina también la base de datos
```

Si quieres reiniciar los datos desde cero:

```bash
docker compose down -v && docker compose up --build
```

### Variables del compose

Definidas en `.env` (copiado de `.env.docker`):

| Variable | Por defecto | Uso |
|---|---|---|
| `APP_KEY` | (incluida) | Clave de cifrado de Laravel. **Genera la tuya en producción** con `php artisan key:generate --show`. |
| `APP_ENV` | `local` | `production` activa el cache de configuración y rutas en el entrypoint. |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `library_books` / `library` / `secret` | Credenciales de PostgreSQL. |
| `API_PORT` | `8000` | Puerto del host para la API. |
| `FRONTEND_PORT` | `3000` | Puerto del host para la SPA. |

> PostgreSQL 18 usa el volumen montado en `/var/lib/postgresql`. Si vienes de una versión anterior con `/var/lib/postgresql/data`, elimina el volumen (`docker compose down -v`).

---

## 2. Arranque sin Docker (desarrollo)

Requisitos: PHP 8.3+ con `pdo_pgsql`, Composer 2, Node.js 22+, y un PostgreSQL 18 accesible.

```bash
# Backend
composer install
cp .env.example .env          # ajusta DB_HOST al de tu Postgres local (por defecto "db")
php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

En desarrollo, Vite hace proxy de `/api` a `http://127.0.0.1:8000` (configurable con `VITE_API_PROXY`), por lo que no hace falta CORS.

Atajo para el backend: `composer run setup` instala dependencias, crea `.env`, genera la clave y migra con seed.

---

## 3. Estructura del proyecto

```
manage-library-books/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── BookController.php        # index, store, show, update, destroy
│   │   │   └── CategoryController.php
│   │   ├── Requests/
│   │   │   ├── Book/{StoreBookRequest,UpdateBookRequest,FilterBooksRequest}.php
│   │   │   └── Category/{StoreCategoryRequest,UpdateCategoryRequest}.php
│   │   └── Resources/
│   │       ├── BookResource.php, BookCollection.php
│   │       └── CategoryResource.php
│   └── Models/{Book,Category}.php
├── database/
│   ├── migrations/                       # categories y books
│   ├── factories/                        # BookFactory, CategoryFactory
│   └── seeders/                          # CategorySeeder, BookSeeder, DatabaseSeeder
├── lang/es/                              # Traducciones de validación y paginación
├── routes/
│   ├── api.php                           # Rutas /api/v1
│   └── web.php                           # Info básica de la API
├── tests/
│   ├── Feature/Api/{BookApiTest,CategoryApiTest}.php
│   └── Unit/BookTest.php
├── frontend/
│   ├── src/
│   │   ├── api/                          # Cliente fetch y llamadas a la API
│   │   ├── components/                   # Button, Field, Alert, Pagination, Dialog, estados
│   │   ├── layouts/AppLayout.tsx
│   │   ├── pages/books/                  # BooksPage y BookFormPage
│   │   ├── pages/categories/             # CategoriesPage
│   │   └── types/                        # Tipos compartidos con la API
│   ├── Dockerfile                        # deps → build → nginx:alpine
│   └── nginx.conf                        # Fallback SPA + proxy FastCGI de /api
├── docker/php/Dockerfile                 # composer:2 → php:8.5-fpm-alpine
├── docker/php/entrypoint.sh              # Espera la BD, migra y siembra
├── docker/nginx/api.conf                 # Nginx para /public + PHP-FPM
├── docker-compose.yml
├── .env.docker                           # Variables para docker compose
└── PLAN.md                               # Plan de implementación
```

---

## 4. API

Base: `/api/v1`. Todas las respuestas son JSON.

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/books` | Lista paginada (12 por página) | 200 |
| GET | `/books?category={id}` | Filtra por categoría | 200, 422 |
| GET | `/books?page={n}` | Paginación | 200, 422 |
| POST | `/books` | Crea un libro | 201, 422 |
| GET | `/books/{id}` | Detalle de un libro | 200, 404 |
| PUT | `/books/{id}` | Actualiza un libro | 200, 404, 422 |
| DELETE | `/books/{id}` | Elimina un libro | 204, 404 |
| GET | `/categories` | Lista categorías con `books_count` | 200 |
| POST | `/categories` | Crea una categoría | 201, 422 |
| GET | `/categories/{id}` | Detalle de una categoría | 200, 404 |
| PUT | `/categories/{id}` | Actualiza una categoría | 200, 404, 422 |
| DELETE | `/categories/{id}` | Elimina una categoría | 204, 404, **409** si tiene libros |

### Ejemplo de creación

```bash
curl -X POST http://localhost:8000/api/v1/books \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"title":"El principito","author":"Antoine de Saint-Exupéry","published_year":1943,"category_id":1}'
```

Respuesta de validación (422):

```json
{
  "message": "El campo título debe tener al menos 3 caracteres. (and 3 more errors)",
  "errors": {
    "title": ["El campo título debe tener al menos 3 caracteres."],
    "category_id": ["El campo categoría es obligatorio."]
  }
}
```

### Reglas de validación

| Campo | Reglas |
|---|---|
| `title` | requerido, texto, entre 3 y 255 caracteres |
| `author` | requerido, texto, máximo 150 caracteres |
| `description` | opcional, texto, máximo 2000 caracteres |
| `published_year` | requerido, entero, entre 1000 y el año actual |
| `category_id` | requerido, entero, debe existir en `categories` |
| `name` (categoría) | requerido, entre 2 y 100 caracteres, único |

---

## 5. Pruebas y calidad

```bash
php artisan test --compact      # 29 tests (SQLite en memoria)
vendor/bin/pint --dirty         # Formato de código PHP
vendor/bin/phpstan analyse --memory-limit=1G   # Análisis estático (nivel 7)

cd frontend
npm run types:check             # TypeScript
npm run build                   # Build de producción
```

---

## 6. Puntos clave a tener en cuenta

### Datos y base de datos

- **No hay autenticación.** Todos los endpoints son públicos; no lo expongas a Internet sin protegerlo (Sanctum, API key o rate limiting).
- **La base de datos no se expone al host.** Para inspeccionarla:
  `docker compose exec db psql -U library -d library_books`.
- **Las migraciones y el seed se ejecutan en cada arranque** del contenedor `api` cuando `RUN_MIGRATIONS=true`. Son idempotentes (`migrate` no hace nada si todo está al día; los seeders usan `firstOrCreate`/inserción controlada), pero si no quieres re-sembrar en producción pon `RUN_SEEDERS="false"` y `RUN_MIGRATIONS="false"` en el compose.
- **Regla de categoría con libros:** se valida en el controlador (**409 Conflict**) y también con la FK `restrictOnDelete` en PostgreSQL, de modo que nunca queden libros huérfanos.
- **Año de publicación:** la validación acepta de 1000 al año actual; además PostgreSQL tiene un `CHECK` entre 1000 y 2100 como red de seguridad.
- **`published_year` se guarda como `smallint`**, no como tipo `YEAR`: PostgreSQL no tiene type `YEAR` y `smallint` permite el rango histórico.
- **Los borrados son físicos**, no soft deletes.

### Errores HTTP

- **`id` inexistente** → **404** `{"message":"El recurso solicitado no existe."}` gracias al route model binding (`ModelNotFoundException` convertido en el manejador de `bootstrap/app.php`). El método `destroy` no llega a ejecutarse.
- **`id` no numérico** (`/books/abc`) → también **404**.
- **Filtro inválido** (`?category=abc` o una categoría inexistente) → **422**, no se ignora en silencio.
- **Mensajes en español** vía `lang/es/validation.php` + `APP_LOCALE=es`.

### Frontend

- **Sin CORS:** el front habla con `/api` en su propio origen. En Docker, Nginx pasa las peticiones a PHP-FPM por FastCGI. Si despliegas el front y la API en dominios distintos, tendrás que configurar CORS en Laravel (`config/cors.php`) y usar una URL absoluta en `frontend/src/api/client.ts`.
- **Estado del listado en la URL** (`?category=&page=`): filtros y paginación son compartibles y sobreviven a un refresco.
- **Errores 422** se mapean campo por campo en el formulario; el **409** al borrar categorías se muestra como aviso.
- **Validación duplicada a propósito:** el formulario valida en cliente para dar feedback inmediato, pero la fuente de verdad es siempre el `FormRequest` del backend.

### Docker

- **Imágenes multi-stage y ligeras:** Composer se resuelve en `composer:2` y solo el `vendor` final pasa a `php:8.5-fpm-alpine`; la SPA se compila en `node:22-alpine` y solo el `dist/` llega a `nginx:alpine`.
- **`libpq` es necesaria en la imagen final:** sin ella `pdo_pgsql` compila pero falla al cargar (`libpq.so.5` no encontrado). El Dockerfile la instala aparte de las dependencias de compilación.
- **El healthcheck de espera usa PDO directamente**, no `artisan migrate:status` ni `db:show`: esos comandos fallan con una base vacía o si falta la extensión `intl`, produciendo un falso "base de datos no disponible".
- **Los puertos 3000/8000 deben estar libres.** Si están ocupados, cambia `FRONTEND_PORT` / `API_PORT` en `.env` y vuelve a levantar.
- **`opcache.validate_timestamps=0`** (ver `docker/php/php.ini`): los cambios en PHP no se reflejan sin `docker compose restart api` o reconstruir. En desarrollo local no aplica.
- **`APP_KEY`**: la incluida en `.env.docker` es solo para desarrollo local. En cualquier despliegue real genera una nueva con `php artisan key:generate --show`.

### Tests

- Los tests usan **SQLite en memoria**, no PostgreSQL. Las restricciones específicas de Postgres (`CHECK` del año, `restrictOnDelete`) no se ejercitan en la suite: se cubren por la validación del `FormRequest` y el controlador, y se validan en el entorno Docker.
- El servidor de tests no requiere Docker ni una base externa: `php artisan test` funciona con solo PHP.
