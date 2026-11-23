# Build de dependencias de Composer (sin dev, sin scripts).
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

COPY . .

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

# Imagen final mínima de PHP-FPM.
FROM php:8.5-fpm-alpine AS app

RUN apk add --no-cache --virtual .build-deps postgresql-dev build-base \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql \
    && apk del .build-deps \
    && apk add --no-cache libpq

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /var/www/html

COPY --from=vendor --chown=www-data:www-data /app /var/www/html

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]
