import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function IssueBookModal({ book, apiUrl, onClose, onSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    memberName: '',
    memberId: '',
    issueDate: todayStr,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.issueDate > todayStr) {
      setError('Issue Date cannot be a future date.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${apiUrl}/books/${book._id}/issue`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Issue Book</h2>
            <p className="text-xs text-slate-500">{book.bookCode} — {book.title}</p>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Member Name</label>
            <input
              type="text"
              required
              value={formData.memberName}
              onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Ananya Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Member ID</label>
            <input
              type="text"
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. MEM-1042"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
            <input
              type="date"
              required
              max={todayStr}
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Due date will be automatically set to 14 days after Issue Date.</p>
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
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Issuing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}