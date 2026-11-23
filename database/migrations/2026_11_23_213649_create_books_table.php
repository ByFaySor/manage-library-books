<?php

use App\Models\Book;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255)->index();
            $table->string('author', 150);
            $table->text('description')->nullable();
            $table->smallInteger('published_year');
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(sprintf(
                'ALTER TABLE books ADD CONSTRAINT books_published_year_check CHECK (published_year BETWEEN %d AND %d)',
                Book::MIN_PUBLISHED_YEAR,
                Book::MAX_PUBLISHED_YEAR,
            ));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
