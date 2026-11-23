<?php

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('GET /api/v1/books', function () {
    it('lists the books with their category', function () {
        $category = Category::factory()->create(['name' => 'Novela']);
        $book = Book::factory()->for($category)->create(['title' => 'Cien años de soledad']);

        $this->getJson('/api/v1/books')
            ->assertOk()
            ->assertJsonPath('data.0.id', $book->id)
            ->assertJsonPath('data.0.title', 'Cien años de soledad')
            ->assertJsonPath('data.0.category.name', 'Novela')
            ->assertJsonStructure([
                'data' => [['id', 'title', 'author', 'description', 'published_year', 'category_id', 'category']],
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    });

    it('filters the books by category', function () {
        $novela = Category::factory()->create(['name' => 'Novela']);
        $ciencia = Category::factory()->create(['name' => 'Ciencia']);

        Book::factory()->for($novela)->create(['title' => 'El amor en los tiempos del cólera']);
        Book::factory()->for($ciencia)->create(['title' => 'Breves respuestas a las grandes preguntas']);

        $response = $this->getJson('/api/v1/books?category='.$novela->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category_id', $novela->id);

        expect($response->json('data.0.title'))->toBe('El amor en los tiempos del cólera');
    });

    it('rejects a category filter that does not exist', function () {
        $this->getJson('/api/v1/books?category=999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    });

    it('rejects a category filter that is not an integer', function () {
        $this->getJson('/api/v1/books?category=abc')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category');
    });
});

describe('POST /api/v1/books', function () {
    it('creates a book', function () {
        $category = Category::factory()->create();

        $response = $this->postJson('/api/v1/books', [
            'title' => 'El principito',
            'author' => 'Antoine de Saint-Exupéry',
            'description' => 'Un clásico de la literatura infantil.',
            'published_year' => 1943,
            'category_id' => $category->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.title', 'El principito')
            ->assertJsonPath('data.category.id', $category->id);

        $this->assertDatabaseHas('books', [
            'title' => 'El principito',
            'category_id' => $category->id,
        ]);
    });

    it('requires a title of at least three characters', function () {
        $category = Category::factory()->create();

        $this->postJson('/api/v1/books', [
            'title' => 'ab',
            'author' => 'Autor',
            'published_year' => 2000,
            'category_id' => $category->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    });

    it('validates the required fields', function () {
        $this->postJson('/api/v1/books', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'author', 'published_year', 'category_id']);
    });

    it('rejects an invalid published year', function (int $year) {
        $category = Category::factory()->create();

        $this->postJson('/api/v1/books', [
            'title' => 'Libro válido',
            'author' => 'Autor',
            'published_year' => $year,
            'category_id' => $category->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('published_year');
    })->with([999, 2101, 0, -5]);

    it('rejects a category that does not exist', function () {
        $this->postJson('/api/v1/books', [
            'title' => 'Libro válido',
            'author' => 'Autor',
            'published_year' => 2000,
            'category_id' => 999,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category_id');
    });
});

describe('PUT /api/v1/books/{book}', function () {
    it('updates a book', function () {
        $book = Book::factory()->create(['title' => 'Título antiguo']);
        $category = Category::factory()->create();

        $this->putJson("/api/v1/books/{$book->id}", [
            'title' => 'Título renovado',
            'author' => $book->author,
            'published_year' => 2020,
            'category_id' => $category->id,
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Título renovado')
            ->assertJsonPath('data.category_id', $category->id);
    });

    it('validates the payload when updating', function () {
        $book = Book::factory()->create();

        $this->putJson("/api/v1/books/{$book->id}", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'author', 'published_year', 'category_id']);
    });

    it('returns not found when the book does not exist', function () {
        $category = Category::factory()->create();

        $this->putJson('/api/v1/books/999', [
            'title' => 'Título válido',
            'author' => 'Autor',
            'published_year' => 2020,
            'category_id' => $category->id,
        ])->assertNotFound();
    });
});

describe('DELETE /api/v1/books/{book}', function () {
    it('deletes a book', function () {
        $book = Book::factory()->create();

        $this->deleteJson("/api/v1/books/{$book->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    });

    it('returns not found when the book does not exist', function () {
        $this->deleteJson('/api/v1/books/999')
            ->assertNotFound()
            ->assertJsonPath('message', 'El recurso solicitado no existe.');
    });
});
