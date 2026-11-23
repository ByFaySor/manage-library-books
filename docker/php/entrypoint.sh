#!/bin/sh
set -e

if [ "${APP_ENV}" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
fi

if [ "${RUN_MIGRATIONS}" = "true" ]; then
    echo "Esperando a la base de datos..."
    attempts=0

    until php -r '
        $dsn = sprintf(
            "pgsql:host=%s;port=%s;dbname=%s;connect_timeout=3",
            getenv("DB_HOST") ?: "db",
            getenv("DB_PORT") ?: "5432",
            getenv("DB_DATABASE") ?: "library_books",
        );

        try {
            new PDO($dsn, getenv("DB_USERNAME") ?: "library", getenv("DB_PASSWORD") ?: "");
            exit(0);
        } catch (Throwable $exception) {
            fwrite(STDERR, $exception->getMessage().PHP_EOL);
            exit(1);
        }
    '; do
        attempts=$((attempts + 1))

        if [ "${attempts}" -ge 30 ]; then
            echo "La base de datos no respondió a tiempo." >&2
            exit 1
        fi

        sleep 2
    done

    php artisan migrate --force --no-interaction

    if [ "${RUN_SEEDERS}" = "true" ]; then
        php artisan db:seed --force --no-interaction
    fi
fi

exec "$@"
