import React, { useState } from 'react';
import { Loan, Book, User } from '../types';
import { Calendar, Clock, RotateCw, AlertTriangle, CheckCircle2, BookOpen, ArrowRight, Check, ArrowLeft, Shield } from 'lucide-react';

interface StudentLoansProps {
  loans: Loan[];
  books: Book[];
  currentUser: User;
  onRenewLoan: (loanId: string) => void;
  onReturnBook: (loanId: string) => void;
  onNavigateToCatalog: () => void;
}

export const StudentLoans: React.FC<StudentLoansProps> = ({
  loans,
  books,
  currentUser,
  onRenewLoan,
  onReturnBook,
  onNavigateToCatalog,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmReturnModal, setConfirmReturnModal] = useState<Loan | null>(null);

  // Active loans for this student
  const activeLoans = loans.filter(
    (l) => l.userId === currentUser.id && l.returnedAt === null
  );

  // Returned history for this student
  const returnedLoans = loans.filter(
    (l) => l.userId === currentUser.id && l.returnedAt !== null
  );

  // Calculate day difference relative to 2026-10-23
  const getDaysDiff = (dueDateStr: string) => {
    const today = new Date('2026-10-23T00:00:00');
    const due = new Date(`${dueDateStr}T00:00:00`);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (dueDateStr: string) => {
    const days = getDaysDiff(dueDateStr);

    if (days < 0) {
      return {
        label: `Atrasado há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`,
        color: 'bg-rose-950/70 text-rose-300 border-rose-500/50',
        icon: AlertTriangle,
        badgeType: 'atrasado',
        daysText: `${Math.abs(days)} dias de atraso`,
      };
    }
    if (days <= 3) {
      return {
        label: days === 0 ? 'Vence hoje!' : `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
        color: 'bg-amber-950/70 text-amber-300 border-amber-500/50 font-bold',
        icon: Clock,
        badgeType: 'vence_em_breve',
        daysText: days === 0 ? 'Prazo encerra hoje' : `Restam ${days} dias`,
      };
    }
    return {
      label: `Em dia · Restam ${days} dias`,
      color: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 font-semibold',
      icon: CheckCircle2,
      badgeType: 'em_dia',
      daysText: `Restam ${days} dias`,
    };
  };

  const handleRenew = (loanId: string) => {
    onRenewLoan(loanId);
    setToastMessage('Empréstimo renovado com sucesso por mais 7 dias!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteReturn = (loan: Loan) => {
    onReturnBook(loan.id);
    setConfirmReturnModal(null);
    setToastMessage('Livro devolvido com sucesso à biblioteca! O exemplar já foi liberado no acervo escolar.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Student Identification */}
      <div className="bg-[#0A192F] rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 font-semibold border border-blue-500/30">
              Painel do Aluno
            </span>
            <span className="text-xs text-slate-400">Matrícula: <strong className="text-blue-400 font-mono">{currentUser.matricula}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Meus Empréstimos & Devoluções
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Acompanhe as datas limites de entrega dos seus livros, renove o prazo ou faça a devolução direta com um clique.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 bg-[#071324] p-3.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Livros em Mãos</span>
            <span className="text-2xl font-bold text-white tabular-nums">{activeLoans.length}</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Devolvidos</span>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{returnedLoans.length}</span>
          </div>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Livros Atualmente com Você ({activeLoans.length})</h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Consultar mais obras no acervo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Você não possui livros pendentes!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Todos os seus empréstimos estão em dia. Que tal explorar novas obras literárias para a sua próxima leitura?
            </p>
            <button
              onClick={onNavigateToCatalog}
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Catálogo do Colégio</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              if (!book) return null;

              const status = getStatusBadge(loan.dueDate);
              const StatusIcon = status.icon;

              return (
                <div
                  key={loan.id}
                  className="bg-[#0A192F] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    {/* Status badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{status.label}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Protocolo: #{loan.id.slice(-6)}
                      </span>
                    </div>

                    {/* Book title and author */}
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug line-clamp-1 font-serif">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {book.author} · <span className="font-mono text-slate-500">{book.isbn}</span>
                      </p>
                    </div>

                    {/* Dates highlight */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#071324] border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data do Empréstimo</span>
                        <span className="font-semibold text-slate-300">{loan.borrowedAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data Limite de Devolução</span>
                        <span className="font-bold text-amber-400">{loan.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Devolver Livro & Renovar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    {/* Return book button */}
                    <button
                      onClick={() => setConfirmReturnModal(loan)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Devolver Livro Agora</span>
                    </button>

                    {/* Renew button */}
                    <button
                      onClick={() => handleRenew(loan.id)}
                      disabled={loan.renewals >= 2}
                      className="py-2.5 px-3 rounded-xl bg-[#071324] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={loan.renewals >= 2 ? 'Limite de 2 renovações atingido' : 'Renovar por mais 7 dias'}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Renovar ({loan.renewals}/2)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Returned Loans History */}
      {returnedLoans.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white">Histórico de Livros Devolvidos ({returnedLoans.length})</h2>
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071324] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Livro</th>
                    <th className="py-3 px-4">Autor</th>
                    <th className="py-3 px-4">Empréstimo</th>
                    <th className="py-3 px-4">Devolvido em</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {returnedLoans.map((loan) => {
                    const book = books.find((b) => b.id === loan.bookId);
                    return (
                      <tr key={loan.id} className="hover:bg-slate-850">
                        <td className="py-3 px-4 font-semibold text-white">
                          {book?.title || 'Título desconhecido'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{book?.author}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{loan.borrowedAt}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{loan.returnedAt}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Devolvido</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {confirmReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0A192F] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="w-12 h-12 rounded-xl bg-[#071324] border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Confirmar Devolução do Exemplar?</h3>
              <p className="text-xs text-slate-400">
                Você está registrando a devolução do livro à biblioteca do Colégio Unidade Polo. O exemplar ficará disponível imediatamente para outros alunos.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#071324] border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Obra Selecionada:</span>
              <p className="font-bold text-white font-serif text-sm">
                {books.find((b) => b.id === confirmReturnModal.bookId)?.title}
              </p>
              <p className="text-slate-400">
                {books.find((b) => b.id === confirmReturnModal.bookId)?.author}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmReturnModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#071324] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExecuteReturn(confirmReturnModal)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
