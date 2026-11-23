<?php

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('filters books by category through the scope', function () {
    $novela = Category::factory()->create();
    $ciencia = Category::factory()->create();

    Book::factory()->count(2)->for($novela)->create();
    Book::factory()->for($ciencia)->create();

    expect(Book::query()->filterByCategory($novela->id)->count())->toBe(2)
        ->and(Book::query()->filterByCategory(null)->count())->toBe(3);
});

it('casts the published year to an integer', function () {
    $book = Book::factory()->create(['published_year' => 1954]);

    expect($book->fresh()->published_year)->toBeInt();
});
