import React, { useState } from 'react';
import { Loan, Book, User } from '../types';
import { Search, CheckCircle2, Clock, AlertTriangle, MessageSquare, RotateCcw, Filter, Check } from 'lucide-react';

interface AdminLoansManagerProps {
  loans: Loan[];
  books: Book[];
  users: User[];
  onReturnBook: (loanId: string) => void;
}

export const AdminLoansManager: React.FC<AdminLoansManagerProps> = ({
  loans,
  books,
  users,
  onReturnBook,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getDaysDiff = (dueDateStr: string) => {
    const today = new Date('2026-10-23T00:00:00');
    const due = new Date(`${dueDateStr}T00:00:00`);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredLoans = loans.filter((loan) => {
    const book = books.find((b) => b.id === loan.bookId);
    const user = users.find((u) => u.id === loan.userId);

    const q = search.toLowerCase();
    const matchesSearch =
      (book?.title.toLowerCase().includes(q) ?? false) ||
      (user?.name.toLowerCase().includes(q) ?? false) ||
      (user?.matricula.toLowerCase().includes(q) ?? false);

    const days = getDaysDiff(loan.dueDate);
    const isReturned = loan.returnedAt !== null;
    const isOverdue = !isReturned && days < 0;

    if (statusFilter === 'active') return !isReturned && matchesSearch;
    if (statusFilter === 'overdue') return isOverdue && matchesSearch;
    if (statusFilter === 'returned') return isReturned && matchesSearch;

    return matchesSearch;
  });

  const handleConfirmReturn = (loanId: string) => {
    onReturnBook(loanId);
    setToastMessage('Devolução registrada com sucesso! Exemplar recolocado no acervo.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-semibold">
            Circulação de Exemplares
          </span>
          <span className="text-xs text-slate-400">Total no Histórico: <strong className="text-white">{loans.length} registros</strong></span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Todos os Empréstimos & Histórico</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Registro completo de empréstimos, devoluções e renovações da Biblioteca do Colégio Unidade Polo.
        </p>
      </div>

      {/* Filter and search */}
      <div className="bg-[#0A192F] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por livro, aluno ou matrícula..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#071324] border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#071324] text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#071324] text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Ativos em Mãos
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-[#071324] text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Atrasados
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              statusFilter === 'returned'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#071324] text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Devolvidos
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071324] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Aluno(a)</th>
                <th className="py-3 px-4">Livro</th>
                <th className="py-3 px-4">Empréstimo</th>
                <th className="py-3 px-4">Prazo Devolução</th>
                <th className="py-3 px-4">Devolvido em</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLoans.map((loan) => {
                const book = books.find((b) => b.id === loan.bookId);
                const user = users.find((u) => u.id === loan.userId);
                const days = getDaysDiff(loan.dueDate);
                const isReturned = loan.returnedAt !== null;
                const isOverdue = !isReturned && days < 0;

                return (
                  <tr key={loan.id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-sm">{user?.name || 'Aluno'}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{user?.matricula} · {user?.turma}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white font-serif">{book?.title}</p>
                      <p className="text-slate-400 text-[11px]">{book?.author}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{loan.borrowedAt}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {loan.dueDate}
                      </span>
                      {!isReturned && (
                        <span className="block text-[10px] text-slate-400">
                          {isOverdue ? `${Math.abs(days)} dias de atraso` : `Restam ${days} dias`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {loan.returnedAt ? (
                        <span className="text-emerald-400 font-semibold">{loan.returnedAt}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Devolvido</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Atrasado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-500/40 text-[10px] font-semibold">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>Em Dia</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isReturned ? (
                        <button
                          onClick={() => handleConfirmReturn(loan.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Dar Baixa
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Concluído</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
