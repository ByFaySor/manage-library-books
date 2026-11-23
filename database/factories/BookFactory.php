<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(nbWords: 4),
            'author' => $this->faker->name(),
            'description' => $this->faker->optional(0.8)->paragraph(),
            'published_year' => $this->faker->numberBetween(Book::MIN_PUBLISHED_YEAR, (int) date('Y')),
            'category_id' => Category::factory(),
        ];
    }
}
