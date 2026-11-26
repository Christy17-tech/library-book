import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, RotateCcw } from 'lucide-react';

export default function BookDetailsModal({ bookId, apiUrl, onClose, onDataChange }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [returningId, setReturningId] = useState(null);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/books/${bookId}`);
      setBook(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const handleReturn = async (loanId) => {
    try {
      setReturningId(loanId);
      setActionMsg('');
      const res = await axios.post(`${apiUrl}/books/${bookId}/return/${loanId}`);
      setActionMsg(res.data.message);
      await fetchBookDetails();
      onDataChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning book');
    } finally {
      setReturningId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              {book?.bookCode || 'Loading...'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{book?.title}</h2>
            {book && (
              <p className="text-sm text-slate-500">
                by <span className="font-medium text-slate-700">{book.author}</span> • ISBN: {book.isbn} • Category: {book.category}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {actionMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
              {actionMsg}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Loan History ({book?.loans?.length || 0})</h3>
            {book && (
              <span className="text-sm font-medium text-slate-600">
                Available Copies:{' '}
                <strong className={book.availableCopies === 0 ? 'text-red-600' : 'text-emerald-600'}>
                  {book.availableCopies} / {book.totalCopies}
                </strong>
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-center py-8 text-slate-500">Loading loan records...</p>
          ) : book?.loans?.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
              No loan records found for this book yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Return Date</th>
                    <th className="py-3 px-4">Fine</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {book.loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">{loan.memberName}</td>
                      <td className="py-3 px-4 text-slate-600">{loan.memberId}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(loan.issueDate)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(loan.dueDate)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(loan.returnDate)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">₹{loan.fine}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {loan.status === 'Returned' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Returned
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Issued
                            </span>
                          )}
                          {loan.isOverdue && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {loan.status === 'Issued' ? (
                          <button
                            onClick={() => handleReturn(loan._id)}
                            disabled={returningId === loan._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {returningId === loan._id ? 'Returning...' : 'Return'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}