<?php

namespace App\Http\Requests\Book;

use App\Models\Book;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'author' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'published_year' => ['required', 'integer', 'between:'.Book::MIN_PUBLISHED_YEAR.','.self::maxPublishedYear()],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ];
    }

    /**
     * Último año considerado válido (el año en curso).
     */
    public static function maxPublishedYear(): int
    {
        return (int) date('Y');
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'published_year.between' => 'El año de publicación debe estar entre :min y :max.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
        ];
    }
}
