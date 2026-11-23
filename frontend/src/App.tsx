import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { BooksPage } from './pages/books/BooksPage';
import { BookFormPage } from './pages/books/BookFormPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/books" replace />} />
                <Route path="books" element={<BooksPage />} />
                <Route path="books/new" element={<BookFormPage />} />
                <Route path="books/:id/edit" element={<BookFormPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
