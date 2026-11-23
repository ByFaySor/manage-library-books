<?php

namespace App\Models;

use Database\Factories\BookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $author
 * @property string|null $description
 * @property int $published_year
 * @property int $category_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 */
#[Fillable(['title', 'author', 'description', 'published_year', 'category_id'])]
class Book extends Model
{
    /** @use HasFactory<BookFactory> */
    use HasFactory;

    /**
     * Primer año aceptado como válido para un libro.
     */
    public const MIN_PUBLISHED_YEAR = 1000;

    /**
     * Último año aceptado como válido para un libro.
     */
    public const MAX_PUBLISHED_YEAR = 2100;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_year' => 'integer',
        ];
    }

    /**
     * Categoría a la que pertenece el libro.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Filtra los libros por categoría cuando se recibe un identificador.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeFilterByCategory(Builder $query, ?int $categoryId): void
    {
        $query->when(
            $categoryId !== null,
            fn (Builder $query) => $query->where('category_id', $categoryId),
        );
    }
}
