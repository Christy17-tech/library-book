import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Library,
  Plus,
  Search,
  BookPlus,
  Edit2,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatsBar from './components/StatsBar';
import AddBookModal from './components/AddBookModal';
import EditBookModal from './components/EditBookModal';
import IssueBookModal from './components/IssueBookModal';
import BookDetailsModal from './components/BookDetailsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Technology', 'Biography', 'Other'];

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCopies: 0,
    copiesIssued: 0,
    overdueLoans: 0,
    totalFineCollected: 0,
  });

  // Filters & Pagination
  const [category, setCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [issuingBook, setIssuingBook] = useState(null);
  const [detailsBookId, setDetailsBookId] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/books/stats`);
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/books`, {
        params: {
          category,
          availableOnly,
          search,
          page,
        },
      });
      setBooks(res.data.data.books);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  }, [category, availableOnly, search, page]);

  const refreshAll = useCallback(() => {
    fetchBooks();
    fetchStats();
  }, [fetchBooks, fetchStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}" (${book.bookCode})?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/books/${book._id}`);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete this book.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Library Book Lending Manager
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Catalog, Circulation & Fine Management
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Section */}
        <StatsBar stats={stats} />

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Search by book title or author..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => handleFilterChange(setAvailableOnly, e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Available Only</span>
            </label>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-4">Book Code</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Available / Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      Loading books...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No books match the current filters.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => {
                    const hasIssuedCopies = book.availableCopies < book.totalCopies;
                    return (
                      <tr key={book._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">
                          {book.bookCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{book.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{book.author}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {book.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold ${
                              book.availableCopies === 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setIssuingBook(book)}
                              disabled={book.availableCopies === 0}
                              title={book.availableCopies === 0 ? 'No copies available' : 'Issue Book'}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <BookPlus className="w-3.5 h-3.5" />
                              Issue
                            </button>

                            <button
                              onClick={() => setDetailsBookId(book._id)}
                              title="Loan History & Returns"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            >
                              <History className="w-3.5 h-3.5" />
                              Loans
                            </button>

                            <button
                              onClick={() => setEditingBook(book)}
                              title="Edit Book"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(book)}
                              disabled={hasIssuedCopies}
                              title={
                                hasIssuedCopies
                                  ? 'Cannot delete while copies are issued'
                                  : 'Delete Book'
                              }
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Page <strong className="text-slate-900">{page}</strong> of{' '}
              <strong className="text-slate-900">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddBookModal
          apiUrl={API_URL}
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshAll}
        />
      )}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          apiUrl={API_URL}
          onClose={() => setEditingBook(null)}
          onSuccess={refreshAll}
        />
      )}

      {issuingBook && (
        <IssueBookModal
          book={issuingBook}
          apiUrl={API_URL}
          onClose={() => setIssuingBook(null)}
          onSuccess={refreshAll}
        />
      )}

      {detailsBookId && (
        <BookDetailsModal
          bookId={detailsBookId}
          apiUrl={API_URL}
          onClose={() => setDetailsBookId(null)}
          onDataChange={refreshAll}
        />
      )}
    </div>
  );
}