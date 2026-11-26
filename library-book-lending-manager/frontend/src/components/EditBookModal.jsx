import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function EditBookModal({ book, apiUrl, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    totalCopies: book.totalCopies,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentlyIssued = book.totalCopies - book.availableCopies;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const copies = Number(formData.totalCopies);
    if (!Number.isInteger(copies) || copies < 1 || copies > 20) {
      setError('Total Copies must be between 1 and 20.');
      return;
    }
    if (copies < currentlyIssued) {
      setError(`Total Copies cannot be less than currently issued copies (${currentlyIssued}).`);
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${apiUrl}/books/${book._id}`, {
        title: formData.title.trim(),
        author: formData.author.trim(),
        totalCopies: copies,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900">Edit Book ({book.bookCode})</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Book Code</span>
              <span className="font-semibold text-slate-800">{book.bookCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ISBN</span>
              <span className="font-semibold text-slate-800">{book.isbn}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Category</span>
              <span className="font-semibold text-slate-800">{book.category}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Copies (Min: {Math.max(1, currentlyIssued)}, Max: 20)
            </label>
            <input
              type="number"
              min={Math.max(1, currentlyIssued)}
              max="20"
              required
              value={formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Currently issued copies: {currentlyIssued}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}