import React from 'react';
import { Book, Loan, User } from '../types';
import { BookOpen, CheckCircle, AlertTriangle, Users, BookMarked, ArrowUpRight, Check, ArrowRight, Shield } from 'lucide-react';

interface AdminDashboardProps {
  books: Book[];
  loans: Loan[];
  users: User[];
  onNavigate: (view: string) => void;
  onReturnBook: (loanId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  loans,
  users,
  onNavigate,
  onReturnBook,
}) => {
  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeLoans = loans.filter((l) => l.returnedAt === null);

  // Overdue calculation (dueDate < 2026-10-23)
  const overdueLoans = activeLoans.filter((l) => {
    return l.dueDate < '2026-10-23';
  });

  const studentsCount = users.filter((u) => u.role === 'student').length;

  return (
    <div className="space-y-8 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-semibold">
              Painel Administrativo da Coordenação
            </span>
            <span className="text-xs text-slate-400">Usuário: <strong className="text-white font-mono">ADMIN</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard da Biblioteca Escolar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Colégio Unidade Polo · Visão consolidada do acervo, circulação de exemplares e devoluções.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-books')}
            className="px-4 py-2 bg-[#0A192F] hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Gerenciar Acervo
          </button>
          <button
            onClick={() => onNavigate('admin-loans')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Ver Todos Empréstimos
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0A192F] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Títulos</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tabular-nums">{totalBooks}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalCopies} exemplares físicos</span>
        </div>

        <div className="bg-[#0A192F] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Disponíveis</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 tabular-nums">{availableCopies}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Prontos para empréstimo</span>
        </div>

        <div className="bg-[#0A192F] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Empréstimos</span>
            <BookMarked className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-2 tabular-nums">{activeLoans.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Circulando com alunos</span>
        </div>

        <div className="bg-[#0A192F] p-5 rounded-2xl border border-rose-500/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Atrasados</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2 tabular-nums">{overdueLoans.length}</p>
          <span className="text-[11px] text-rose-300 mt-0.5 block">Prazo estourado</span>
        </div>

        <div className="bg-[#0A192F] p-5 rounded-2xl border border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alunos Ativos</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tabular-nums">{studentsCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Alunos cadastrados</span>
        </div>
      </div>

      {/* Main Grid: Overdue Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Overdue Loans Priority Table */}
        <div className="lg:col-span-2 bg-[#0A192F] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Devoluções Atrasadas (Atenção Prioritária)</h2>
            </div>
            <button
              onClick={() => onNavigate('coordinator-pending')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver painel de cobrança</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="p-8 text-center bg-[#071324] rounded-xl border border-slate-800 text-xs text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-white">Nenhum empréstimo em atraso!</p>
              <p className="mt-0.5">Todos os livros em circulação estão dentro do prazo regulamentar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071324] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Aluno</th>
                    <th className="py-2.5 px-3">Livro</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {overdueLoans.slice(0, 5).map((loan) => {
                    const student = users.find((u) => u.id === loan.userId);
                    const book = books.find((b) => b.id === loan.bookId);

                    return (
                      <tr key={loan.id} className="hover:bg-slate-850">
                        <td className="py-3 px-3">
                          <p className="font-bold text-white">{student?.name}</p>
                          <p className="text-[11px] text-slate-400">{student?.turma} · {student?.matricula}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-200">{book?.title}</p>
                          <p className="text-[11px] text-slate-400">{book?.author}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-rose-400 block">{loan.dueDate}</span>
                          <span className="text-[10px] text-rose-300">Prazo expirado</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onReturnBook(loan.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Dar Baixa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Quick Access */}
        <div className="space-y-6">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-white">Ações da Coordenação</h2>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('admin-books')}
                className="w-full p-3 rounded-xl bg-[#071324] hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white text-xs">Cadastrar Novo Livro</p>
                  <p className="text-[11px] text-slate-400">Adicionar exemplar com ISBN e localização</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>

              <button
                onClick={() => onNavigate('coordinator-pending')}
                className="w-full p-3 rounded-xl bg-[#071324] hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white text-xs">Cobrança de Pendências</p>
                  <p className="text-[11px] text-slate-400">Avisos automáticos de devolução no WhatsApp</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => onNavigate('catalog')}
                className="w-full p-3 rounded-xl bg-[#071324] hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white text-xs">Visualizar como Aluno</p>
                  <p className="text-[11px] text-slate-400">Ver acervo e catálogo público</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
