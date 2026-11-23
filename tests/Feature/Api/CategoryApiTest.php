<?php

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('GET /api/v1/categories', function () {
    it('lists the categories with their books count', function () {
        $category = Category::factory()->create(['name' => 'Poesía']);
        Book::factory()->count(3)->for($category)->create();

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Poesía')
            ->assertJsonPath('data.0.books_count', 3);
    });
});

describe('POST /api/v1/categories', function () {
    it('creates a category', function () {
        $this->postJson('/api/v1/categories', ['name' => 'Ensayo'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Ensayo');

        $this->assertDatabaseHas('categories', ['name' => 'Ensayo']);
    });

    it('rejects a duplicated name', function () {
        Category::factory()->create(['name' => 'Historia']);

        $this->postJson('/api/v1/categories', ['name' => 'Historia'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    });

    it('requires a name', function () {
        $this->postJson('/api/v1/categories', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    });
});

describe('PUT /api/v1/categories/{category}', function () {
    it('updates a category', function () {
        $category = Category::factory()->create(['name' => 'Infantil']);

        $this->putJson("/api/v1/categories/{$category->id}", ['name' => 'Literatura infantil'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Literatura infantil');
    });

    it('allows keeping its own name', function () {
        $category = Category::factory()->create(['name' => 'Tecnología']);

        $this->putJson("/api/v1/categories/{$category->id}", ['name' => 'Tecnología'])
            ->assertOk();
    });

    it('rejects a name used by another category', function () {
        Category::factory()->create(['name' => 'Ciencia']);
        $category = Category::factory()->create(['name' => 'Historia']);

        $this->putJson("/api/v1/categories/{$category->id}", ['name' => 'Ciencia'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    });
});

describe('DELETE /api/v1/categories/{category}', function () {
    it('deletes a category without books', function () {
        $category = Category::factory()->create();

        $this->deleteJson("/api/v1/categories/{$category->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    });

    it('refuses to delete a category that has books', function () {
        $category = Category::factory()->create();
        Book::factory()->for($category)->create();

        $this->deleteJson("/api/v1/categories/{$category->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'No se puede eliminar una categoría que tiene libros asociados.');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    });

    it('returns not found when the category does not exist', function () {
        $this->deleteJson('/api/v1/categories/999')
            ->assertNotFound();
    });
});
