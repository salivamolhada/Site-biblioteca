import React from 'react';
import { Book, Loan, User } from '../types';
import { BookOpen, CheckCircle, AlertTriangle, Users, BookMarked, ArrowUpRight, Check, ArrowRight, Shield, MessageSquare } from 'lucide-react';

interface AdminDashboardProps {
  books: Book[];
  loans: Loan[];
  users: User[];
  onNavigate: (view: string) => void;
  onReturnBook: (loanId: string) => void;
  onOpenChatWithStudent?: (userId?: string, bookId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  loans,
  users,
  onNavigate,
  onReturnBook,
  onOpenChatWithStudent,
}) => {
  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeLoans = loans.filter((l) => l.returnedAt === null);

  // Overdue calculation (dueDate < 2026-10-26)
  const overdueLoans = activeLoans.filter((l) => {
    return l.dueDate < '2026-10-26';
  });

  const studentsCount = users.filter((u) => u.role === 'student').length;

  return (
    <div className="space-y-8 text-stone-100">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="text-amber-400 font-semibold uppercase tracking-wider">
              Coordenação da Biblioteca
            </span>
            <span aria-hidden="true">·</span>
            <span>Credencial: <strong className="text-white font-mono">ADMIN</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel Geral de Gestão do Acervo
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Colégio Unidade Polo · Visão consolidada de inventário, circulação e devoluções.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenChatWithStudent?.()}
            className="px-3.5 py-2 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Chat de Cobrança</span>
          </button>
          <button
            onClick={() => onNavigate('admin-users')}
            className="px-4 py-2 bg-[#11100E] hover:bg-stone-800 text-stone-200 border border-stone-700/80 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Alunos ({users.filter((u) => u.role === 'student').length})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-books')}
            className="px-4 py-2 bg-[#11100E] hover:bg-stone-800 text-stone-200 border border-stone-700/80 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Gerenciar Acervo
          </button>
          <button
            onClick={() => onNavigate('admin-loans')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Circulação Completa
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#181715] p-5 rounded-2xl border border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Títulos Únicos</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono tabular-nums">{totalBooks}</p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">{totalCopies} exemplares físicos</span>
        </div>

        <div className="bg-[#181715] p-5 rounded-2xl border border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Disponíveis</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono tabular-nums">{availableCopies}</p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Prontos para retirada</span>
        </div>

        <div className="bg-[#181715] p-5 rounded-2xl border border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Em Circulação</span>
            <BookMarked className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-200 mt-2 font-mono tabular-nums">{activeLoans.length}</p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Com alunos e professores</span>
        </div>

        <div className="bg-[#181715] p-5 rounded-2xl border border-rose-500/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Em Atraso</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 font-mono tabular-nums">{overdueLoans.length}</p>
          <span className="text-[11px] text-rose-300 mt-0.5 block">Cobrança pendente</span>
        </div>

        <div
          onClick={() => onNavigate('admin-users')}
          className="bg-[#181715] p-5 rounded-2xl border border-stone-800 hover:border-emerald-500/50 shadow-xs col-span-2 lg:col-span-1 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Alunos Ativos
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono tabular-nums">{studentsCount}</p>
          <span className="text-[11px] text-emerald-400 mt-0.5 flex items-center justify-between">
            <span>Ver todos no Firebase</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* Main Grid: Overdue Table & Quick Circulation Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Overdue Loans Priority Table */}
        <div className="lg:col-span-2 bg-[#181715] border border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-base font-bold text-white">
                Pendências Críticas de Devolução ({overdueLoans.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('coordinator-pending')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver todas pendências</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Nenhum empréstimo atrasado</p>
              <p className="text-xs text-stone-400">Todas as obras em circulação estão rigorosamente dentro dos prazos regulamentares.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#11100E] text-stone-400 text-[11px] uppercase tracking-wider font-semibold border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">Aluno</th>
                    <th className="py-2.5 px-3">Livro</th>
                    <th className="py-2.5 px-3">Prazo</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300">
                  {overdueLoans.slice(0, 5).map((loan) => {
                    const student = users.find((u) => u.id === loan.userId);
                    const book = books.find((b) => b.id === loan.bookId);

                    return (
                      <tr key={loan.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-3 font-medium text-white">
                          <div>{student?.name || 'Aluno'}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{student?.matricula}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="line-clamp-1">{book?.title || 'Obra'}</div>
                          <div className="text-[11px] text-stone-400">{book?.author}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-400 font-semibold">
                          {loan.dueDate}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenChatWithStudent?.(loan.userId, loan.bookId)}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              title="Enviar mensagem de cobrança pelo chat"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-400" />
                              <span>Cobrar</span>
                            </button>
                            <button
                              onClick={() => onReturnBook(loan.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shrink-0"
                            >
                              Baixa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: School Circulation Overview */}
        <div className="bg-[#181715] border border-stone-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Diretrizes de Circulação</span>
            </h3>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#11100E] border border-stone-800 space-y-1">
                <span className="font-semibold text-white block">Prazo Padrão de Leitura</span>
                <span className="text-stone-400">14 dias corridos com até 2 renovações automáticas (+7 dias cada).</span>
              </div>

              <div className="p-3 rounded-xl bg-[#11100E] border border-stone-800 space-y-1">
                <span className="font-semibold text-white block">Sincronização em Nuvem</span>
                <span className="text-stone-400">Banco de dados Google Cloud Firestore ativo com persistência em tempo real.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800 space-y-2">
            <button
              onClick={() => onNavigate('admin-books')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer text-center block shadow-xs"
            >
              + Cadastrar Novo Livro no Acervo
            </button>
            <button
              onClick={() => onNavigate('admin-loans')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#11100E] hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 font-medium text-xs transition-colors cursor-pointer text-center block"
            >
              Gerenciar Devoluções e Renovações
            </button>
          </div>
        </div>
      </div>

      {/* Sincronização de Alunos (Visão Geral de Contas Criadas nos Dispositivos) */}
      <div className="bg-[#181715] border border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Alunos Cadastrados na Base de Dados ({users.filter((u) => u.role === 'student').length})
              </h2>
              <p className="text-xs text-stone-400">
                Sincronizados em tempo real através do Google Cloud Firestore entre todos os dispositivos.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-users')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Ver todos e gerenciar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {users
            .filter((u) => u.role === 'student')
            .map((student) => {
              const activeCount = loans.filter((l) => l.userId === student.id && l.returnedAt === null).length;
              return (
                <div
                  key={student.id}
                  onClick={() => onNavigate('admin-users')}
                  className="p-3.5 rounded-xl bg-[#11100E] border border-stone-800 hover:border-emerald-500/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-xs truncate">{student.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono truncate">{student.matricula}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
                    <span className="truncate max-w-[130px]">{student.turma || 'Ensino Médio'}</span>
                    <span className="text-emerald-400 font-mono text-[10px]">
                      {activeCount > 0 ? `${activeCount} livro(s)` : 'Sem livros'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
