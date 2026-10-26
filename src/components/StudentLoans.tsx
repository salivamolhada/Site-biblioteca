import React, { useState } from 'react';
import { Loan, Book, User } from '../types';
import { Calendar, Clock, RotateCw, AlertTriangle, CheckCircle2, BookOpen, ArrowRight, Check, ArrowLeft, Shield, MessageSquare } from 'lucide-react';

interface StudentLoansProps {
  loans: Loan[];
  books: Book[];
  currentUser: User;
  onRenewLoan: (loanId: string) => void;
  onReturnBook: (loanId: string) => void;
  onNavigateToCatalog: () => void;
  onOpenChat?: (bookId?: string) => void;
}

export const StudentLoans: React.FC<StudentLoansProps> = ({
  loans,
  books,
  currentUser,
  onRenewLoan,
  onReturnBook,
  onNavigateToCatalog,
  onOpenChat,
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

  // Calculate day difference relative to 2026-10-26
  const getDaysDiff = (dueDateStr: string) => {
    const today = new Date('2026-10-26T00:00:00');
    const due = new Date(`${dueDateStr}T00:00:00`);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (dueDateStr: string) => {
    const days = getDaysDiff(dueDateStr);

    if (days < 0) {
      return {
        label: `Atrasado há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`,
        color: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
        icon: AlertTriangle,
        badgeType: 'atrasado',
        daysText: `${Math.abs(days)} dias de atraso`,
      };
    }
    if (days <= 3) {
      return {
        label: days === 0 ? 'Vence hoje' : `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
        color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
        icon: Clock,
        badgeType: 'vence_em_breve',
        daysText: days === 0 ? 'Prazo encerra hoje' : `Restam ${days} dias`,
      };
    }
    return {
      label: `Em dia · ${days} dias restantes`,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      icon: CheckCircle2,
      badgeType: 'em_dia',
      daysText: `Restam ${days} dias`,
    };
  };

  const handleRenew = (loanId: string) => {
    onRenewLoan(loanId);
    setToastMessage('Empréstimo renovado com sucesso por mais 7 dias.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteReturn = (loan: Loan) => {
    onReturnBook(loan.id);
    setConfirmReturnModal(null);
    setToastMessage('Livro devolvido com sucesso à biblioteca escolar.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Student Identification */}
      <div className="bg-[#181715] rounded-2xl border border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="text-emerald-400 font-semibold uppercase tracking-wider">
              Área do Aluno
            </span>
            <span aria-hidden="true">·</span>
            <span>Matrícula: <strong className="text-white font-mono">{currentUser.matricula}</strong></span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Empréstimos Ativos & Prazos
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
            Acompanhe as datas limites de entrega dos seus livros, solicite renovações ou execute a devolução digital instantânea.
          </p>
        </div>

        {/* Tabular Stats Strip */}
        <div className="flex items-center gap-6 bg-[#11100E] p-4 rounded-xl border border-stone-800 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px] font-medium">Livros em Mãos</span>
            <span className="text-2xl font-black text-white font-mono tabular-nums">{activeLoans.length}</span>
          </div>
          <div className="border-l border-stone-800 pl-6">
            <span className="text-stone-400 block text-[11px] font-medium">Histórico Devolvido</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{returnedLoans.length}</span>
          </div>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Títulos em Leitura</span>
            <span className="text-xs font-mono font-normal text-stone-400">({activeLoans.length})</span>
          </h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Consultar mais obras</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-[#181715] border border-stone-800 rounded-2xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum livro pendente no momento</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Todos os seus empréstimos estão regularizados. Visite o catálogo do acervo para retirar novas leituras.
            </p>
            <button
              onClick={onNavigateToCatalog}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Catálogo do Acervo</span>
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
                  className="bg-[#181715] border border-stone-800/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Status indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{status.label}</span>
                      </span>

                      <span className="text-[11px] text-stone-400 font-mono">
                        Protocolo #{loan.id.slice(-6)}
                      </span>
                    </div>

                    {/* Book title and author */}
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {book.author} · <span className="font-mono">{book.isbn}</span>
                      </p>
                    </div>

                    {/* Dates highlight */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#11100E] border border-stone-800 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Retirado em</span>
                        <span className="font-mono text-stone-300 font-semibold">{loan.borrowedAt}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Data de Devolução</span>
                        <span className="font-mono text-amber-400 font-bold">{loan.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Devolver Livro & Renovar */}
                  <div className="pt-3 border-t border-stone-800 flex items-center gap-2">
                    {/* Return book button */}
                    <button
                      onClick={() => setConfirmReturnModal(loan)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Devolver Livro Agora</span>
                    </button>

                    {/* Renew button */}
                    <button
                      onClick={() => handleRenew(loan.id)}
                      disabled={loan.renewals >= 2}
                      className="py-2.5 px-3 rounded-xl bg-[#11100E] hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={loan.renewals >= 2 ? 'Limite de 2 renovações atingido' : 'Renovar por mais 7 dias'}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Renovar ({loan.renewals}/2)</span>
                    </button>

                    {/* Chat with Library button */}
                    <button
                      onClick={() => onOpenChat?.(loan.bookId)}
                      className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Falar com a coordenação sobre este livro"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chat</span>
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
        <div className="space-y-3 pt-6 border-t border-stone-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Histórico de Devoluções Concluídas</span>
            <span className="text-xs font-mono font-normal text-stone-400">({returnedLoans.length})</span>
          </h2>

          <div className="bg-[#181715] border border-stone-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#11100E] text-stone-400 border-b border-stone-800 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Obra / Autor</th>
                    <th className="py-3 px-4">Retirado</th>
                    <th className="py-3 px-4">Devolvido em</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300 font-normal">
                  {returnedLoans.map((loan) => {
                    const book = books.find((b) => b.id === loan.bookId);
                    return (
                      <tr key={loan.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          <div>{book ? book.title : 'Obra arquivada'}</div>
                          <div className="text-[11px] text-stone-400">{book?.author}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-400">{loan.borrowedAt}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{loan.returnedAt}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <Check className="w-3 h-3" />
                            <span>Entregue</span>
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

      {/* Confirm Return Modal */}
      {confirmReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#181715] border border-stone-700 rounded-2xl shadow-2xl p-6 text-stone-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white">Confirmar Devolução do Livro?</h3>
              <p className="text-xs text-stone-400">
                Você está registrando a devolução do exemplar abaixo para o acervo escolar:
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11100E] border border-stone-800 text-xs">
              <p className="font-bold text-white text-sm">
                {books.find((b) => b.id === confirmReturnModal.bookId)?.title}
              </p>
              <p className="text-stone-400 mt-0.5">
                {books.find((b) => b.id === confirmReturnModal.bookId)?.author}
              </p>
              <div className="mt-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex justify-between">
                <span>Data do Empréstimo: {confirmReturnModal.borrowedAt}</span>
                <span className="font-semibold text-emerald-400">Devolução Imediata</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReturnModal(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExecuteReturn(confirmReturnModal)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
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
