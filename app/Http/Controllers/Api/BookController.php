<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Book\FilterBooksRequest;
use App\Http\Requests\Book\StoreBookRequest;
use App\Http\Requests\Book\UpdateBookRequest;
use App\Http\Resources\BookCollection;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;

class BookController extends Controller
{
    /**
     * Cantidad de libros por página.
     */
    private const PER_PAGE = 12;

    /**
     * Display a listing of the resource.
     */
    public function index(FilterBooksRequest $request): BookCollection
    {
        $books = Book::query()
            ->with('category')
            ->filterByCategory($request->categoryId())
            ->orderBy('title')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return new BookCollection($books);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = Book::query()->create($request->validated());

        return BookResource::make($book->load('category'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book): JsonResource
    {
        return new BookResource($book->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookRequest $request, Book $book): JsonResource
    {
        $book->update($request->validated());

        return new BookResource($book->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json(status: Response::HTTP_NO_CONTENT);
    }
}
