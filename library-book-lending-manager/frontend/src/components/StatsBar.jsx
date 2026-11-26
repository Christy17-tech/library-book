import React from 'react';
import { BookOpen, Layers, UserCheck, AlertTriangle, IndianRupee } from 'lucide-react';

export default function StatsBar({ stats }) {
  const cards = [
    {
      label: 'Total Titles',
      value: stats.totalTitles,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total Copies',
      value: stats.totalCopies,
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Copies Issued',
      value: stats.copiesIssued,
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Overdue Loans',
      value: stats.overdueLoans,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Fine Collected',
      value: `₹${stats.totalFineCollected}`,
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5"
          >
            <div className={`p-3 rounded-lg ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}