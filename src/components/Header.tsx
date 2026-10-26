import React from 'react';
import { User } from '../types';
import { ShieldCheck, Flame, LogIn, Lock, LogOut, BookOpen, AlertTriangle, UserPlus, Library } from 'lucide-react';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface HeaderProps {
  currentUser: User;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenFirebase: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  currentView: string;
  onNavigate: (view: string) => void;
  activeLoansCount: number;
  overdueLoansCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenFirebase,
  onOpenAuth,
  currentView,
  onNavigate,
  activeLoansCount,
  overdueLoansCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#12110F]/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-sm">
      {/* Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'catalog')}
            className="flex items-center gap-3.5 text-left focus:outline-none cursor-pointer shrink-0 group"
          >
            <ColegioPoloLogo size="md" />
            <div className="hidden sm:block border-l border-stone-800 pl-3.5">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block">
                Biblioteca Escolar
              </span>
              <span className="text-xs text-stone-400">
                Sistema Integrado de Gestão do Conhecimento
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (single-line, clean typography) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors py-1 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                currentView === 'catalog'
                  ? 'text-white font-semibold border-b-2 border-emerald-500'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Catálogo do Acervo</span>
            </button>

            <button
              onClick={() => onNavigate('my-loans')}
              className={`transition-colors py-1 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                currentView === 'my-loans'
                  ? 'text-white font-semibold border-b-2 border-emerald-500'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Meus Empréstimos</span>
              {activeLoansCount > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 tabular-nums">
                  {activeLoansCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`transition-colors py-1 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard'
                      ? 'text-amber-400 font-semibold border-b-2 border-amber-500'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Painel Geral</span>
                </button>

                <button
                  onClick={() => onNavigate('admin-books')}
                  className={`transition-colors py-1 cursor-pointer whitespace-nowrap shrink-0 ${
                    currentView === 'admin-books'
                      ? 'text-amber-400 font-semibold border-b-2 border-amber-500'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>Gestão de Acervo</span>
                </button>

                <button
                  onClick={() => onNavigate('admin-loans')}
                  className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    currentView === 'admin-loans'
                      ? 'text-amber-400 font-semibold border-b-2 border-amber-500'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>Circulação Geral</span>
                  {overdueLoansCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 tabular-nums">
                      {overdueLoansCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('coordinator-pending')}
                  className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    currentView === 'coordinator-pending'
                      ? 'text-amber-400 font-semibold border-b-2 border-amber-500'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cobranças</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Action & Authentication Deck */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Database indicator (subtle, non-distracting) */}
            <button
              onClick={onOpenFirebase}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-900/80 border border-stone-800 transition-colors cursor-pointer"
              title="Banco de dados Google Cloud Firestore conectado via código"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Firestore</span>
            </button>

            {/* Student Account switch or creation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors cursor-pointer"
                title="Trocar aluno ou autenticar"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-stone-200 max-w-[110px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Criar Conta</span>
              </button>
            </div>

            {/* Admin toggle */}
            {isAdmin ? (
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Encerrar sessão administrativa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-950/60 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Área restrita da Coordenadora (ADMIN / ADMIN)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between py-2.5 border-t border-stone-800 text-xs gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('catalog')}
              className={`whitespace-nowrap py-1 ${
                currentView === 'catalog' ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'text-stone-400'
              }`}
            >
              Acervo
            </button>

            <button
              onClick={() => onNavigate('my-loans')}
              className={`whitespace-nowrap py-1 ${
                currentView === 'my-loans' ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'text-stone-400'
              }`}
            >
              Empréstimos ({activeLoansCount})
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`whitespace-nowrap py-1 ${
                  currentView === 'admin-dashboard' ? 'text-amber-400 font-bold' : 'text-stone-400'
                }`}
              >
                Painel
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenAuth('register')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
          >
            + Criar Conta
          </button>
        </div>
      </div>
    </header>
  );
};
