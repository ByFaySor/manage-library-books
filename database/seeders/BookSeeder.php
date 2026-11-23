<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id');

        if ($categoryIds->isEmpty()) {
            $this->call(CategorySeeder::class);
            $categoryIds = Category::query()->pluck('id');
        }

        Book::query()->insert(
            $categoryIds->shuffle()->take(24)->values()->map(
                fn (int $categoryId, int $index) => [
                    'title' => ['Cien años de soledad', 'El principito', 'Dune', 'Sapiens', 'La Odisea', 'Clean Code'][$index % 6].' '.($index + 1),
                    'author' => ['Gabriel García Márquez', 'Antoine de Saint-Exupéry', 'Frank Herbert', 'Yuval Noah Harari', 'Homero', 'Robert C. Martin'][$index % 6],
                    'description' => 'Libro de ejemplo generado por el seeder de la biblioteca.',
                    'published_year' => 1950 + $index,
                    'category_id' => $categoryId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            )->all(),
        );
    }
}
