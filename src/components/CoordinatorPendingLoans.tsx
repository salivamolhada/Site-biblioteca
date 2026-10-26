import React, { useState } from 'react';
import { Loan, Book, User } from '../types';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, Search, UserCheck, Filter, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface CoordinatorPendingLoansProps {
  loans: Loan[];
  books: Book[];
  users: User[];
  onReturnBook: (loanId: string) => void;
}

export const CoordinatorPendingLoans: React.FC<CoordinatorPendingLoansProps> = ({
  loans,
  books,
  users,
  onReturnBook,
}) => {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due_soon'>('overdue');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active unreturned loans only
  const pendingLoans = loans.filter((l) => l.returnedAt === null);

  const getDaysDiff = (dueDateStr: string) => {
    const today = new Date('2026-10-23T00:00:00');
    const due = new Date(`${dueDateStr}T00:00:00`);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueList = pendingLoans.filter((l) => getDaysDiff(l.dueDate) < 0);
  const dueSoonList = pendingLoans.filter((l) => {
    const d = getDaysDiff(l.dueDate);
    return d >= 0 && d <= 3;
  });

  const displayedLoans = pendingLoans.filter((loan) => {
    const days = getDaysDiff(loan.dueDate);
    const book = books.find((b) => b.id === loan.bookId);
    const user = users.find((u) => u.id === loan.userId);

    const q = search.toLowerCase();
    const matchesSearch =
      (user?.name.toLowerCase().includes(q) ?? false) ||
      (user?.matricula.toLowerCase().includes(q) ?? false) ||
      (user?.turma?.toLowerCase().includes(q) ?? false) ||
      (book?.title.toLowerCase().includes(q) ?? false);

    if (filter === 'overdue') return days < 0 && matchesSearch;
    if (filter === 'due_soon') return days >= 0 && days <= 3 && matchesSearch;
    return matchesSearch;
  });

  const handleReturn = (loanId: string) => {
    onReturnBook(loanId);
    setToastMessage('Devolução confirmada pela Coordenação! Exemplar recolocado no acervo.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getWhatsAppReminder = (user?: User, book?: Book, loan?: Loan) => {
    if (!user || !book || !loan) return '#';
    const days = getDaysDiff(loan.dueDate);
    const dateFormatted = loan.dueDate.split('-').reverse().join('/');

    let msg = '';
    if (days < 0) {
      msg = `Olá, *${user.name}*!%0A%0A` +
        `Aqui é da *Coordenação da Biblioteca do Colégio Unidade Polo*.%0A` +
        `Constatamos que o livro *"${book.title}"* está com o prazo de devolução vencido desde *${dateFormatted}* (${Math.abs(days)} dias de atraso).%0A%0A` +
        `Por favor, compareça à biblioteca para devolução ou renovação. Contamos com você! 📚`;
    } else {
      msg = `Olá, *${user.name}*!%0A%0A` +
        `Lembrete da *Biblioteca do Colégio Unidade Polo*: o prazo de devolução do livro *"${book.title}"* vence no dia *${dateFormatted}*.%0A` +
        `Você pode renovar diretamente pelo sistema ou entregar no balcão da biblioteca. Bons estudos! 📚`;
    }

    const cleanPhone = (user.phone || '11999998888').replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}?text=${msg}`;
  };

  return (
    <div className="space-y-6 text-stone-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#181715] rounded-2xl border border-stone-800 p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Coordenação da Biblioteca · Colégio Unidade Polo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              Controle de Livros Pendentes & Cobrança
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Monitore exatamente quais alunos estão com empréstimos ativos e prazos de devolução vencidos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-center shadow-xs">
              <span className="text-[11px] font-bold text-rose-300 uppercase block">Atrasados</span>
              <span className="text-2xl font-bold text-rose-400 tabular-nums">{overdueList.length}</span>
            </div>
            <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-center shadow-xs">
              <span className="text-[11px] font-bold text-amber-300 uppercase block">Vencem Logo</span>
              <span className="text-2xl font-bold text-amber-400 tabular-nums">{dueSoonList.length}</span>
            </div>
            <div className="p-3 bg-[#11100E] border border-stone-700 rounded-xl text-center shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase block">Total Pendente</span>
              <span className="text-2xl font-bold text-white tabular-nums">{pendingLoans.length}</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-4 border-t border-stone-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do aluno, matrícula, turma ou título do livro..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-[#11100E] text-stone-300 hover:text-white border border-stone-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Atrasados ({overdueList.length})</span>
            </button>
            <button
              onClick={() => setFilter('due_soon')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'due_soon'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-[#11100E] text-stone-300 hover:text-white border border-stone-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Vencem em Breve ({dueSoonList.length})</span>
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#11100E] text-stone-300 hover:text-white border border-stone-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Todos ({pendingLoans.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards list */}
      {displayedLoans.length === 0 ? (
        <div className="bg-[#181715] border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhuma pendência encontrada</h3>
          <p className="text-xs text-stone-400">
            Nenhum empréstimo ativo com os critérios e filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedLoans.map((loan) => {
            const user = users.find((u) => u.id === loan.userId);
            const book = books.find((b) => b.id === loan.bookId);
            const days = getDaysDiff(loan.dueDate);
            const isOverdue = days < 0;
            const waUrl = getWhatsAppReminder(user, book, loan);

            return (
              <div
                key={loan.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 bg-[#181715] shadow-sm transition-all ${
                  isOverdue
                    ? 'border-rose-500/50 hover:border-rose-500'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Status badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isOverdue
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-500/50'
                          : days <= 3
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50'
                      }`}
                    >
                      {isOverdue ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{Math.abs(days)} dias de atraso</span>
                        </>
                      ) : days === 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Vence hoje</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Restam {days} dias</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-mono text-stone-400">
                      ID: #{loan.id.slice(-6)}
                    </span>
                  </div>

                  {/* Student info */}
                  <div className="p-3 bg-[#11100E] rounded-xl border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Aluno</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{user?.matricula}</span>
                    </div>
                    <p className="font-bold text-white text-sm">{user?.name || 'Aluno não identificado'}</p>
                    <p className="text-xs text-stone-400">{user?.turma || 'Turma não informada'}</p>
                    <p className="text-xs text-stone-400 font-mono">Tel: {user?.phone || 'Não cadastrado'}</p>
                  </div>

                  {/* Book info */}
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Livro Emprestado</span>
                    <h3 className="font-serif font-bold text-white text-base leading-snug line-clamp-1">
                      {book?.title || 'Título desconhecido'}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-1">{book?.author}</p>
                    <div className="mt-2 text-xs text-stone-300 flex items-center justify-between pt-2 border-t border-stone-800">
                      <span>Data Limite:</span>
                      <strong className={`font-mono ${isOverdue ? 'text-rose-400' : 'text-stone-200'}`}>
                        {loan.dueDate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions: Cobrança WhatsApp & Devolver Livro */}
                <div className="pt-3 border-t border-stone-800 flex items-center gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Enviar cobrança personalizada via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Avisar no WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleReturn(loan.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Registrar devolução no balcão"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Devolvido</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
