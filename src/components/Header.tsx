import React from 'react';
import { User } from '../types';
import { ShieldCheck, Database, LogIn, Lock, LogOut, BookOpen, AlertTriangle, UserPlus, GraduationCap, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface HeaderProps {
  currentUser: User;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenSupabase: () => void;
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
  onOpenSupabase,
  onOpenAuth,
  currentView,
  onNavigate,
  activeLoansCount,
  overdueLoansCount,
}) => {
  const supabaseActive = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 bg-[#0A192F] text-slate-100 border-b border-slate-800 shadow-md">
      {/* Top Academic Sub-Bar */}
      <div className="bg-[#071324] px-4 sm:px-8 py-1.5 border-b border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Institutional Identification */}
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Colégio Unidade Polo · Sistema Integrado de Bibliotecas</span>
            </span>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <span className="text-slate-400 text-[11px] hidden md:inline">
              {isAdmin ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sessão da Coordenadora da Biblioteca Ativa
                </span>
              ) : (
                <span>Aluno Ativo: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.turma || 'Ensino Médio'})</span>
              )}
            </span>
          </div>

          {/* Account Tools */}
          <div className="flex items-center gap-2">
            {/* Database indicator */}
            <button
              onClick={onOpenSupabase}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                supabaseActive
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
              title="Gerenciamento da conexão com banco PostgreSQL / Supabase"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">{supabaseActive ? 'Supabase Conectado' : 'Supabase DB'}</span>
              <span className="sm:hidden">DB</span>
            </button>

            {/* User Profile / Switch Student */}
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
              title="Alternar usuário ou autenticar aluno"
            >
              <LogIn className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Trocar Aluno:</span>
              <span className="font-semibold text-white max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
            </button>

            {/* Criar Conta (Registration) */}
            <button
              onClick={() => onOpenAuth('register')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Criar Conta Aluno</span>
            </button>

            {/* Admin Login/Logout */}
            {isAdmin ? (
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Sair do modo administrador"
              >
                <LogOut className="w-3 h-3" />
                <span>Sair Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Acesso exclusivo da Coordenadora da Biblioteca (ADMIN / ADMIN)"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Admin (ADMIN/ADMIN)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'catalog')}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer shrink-0"
          >
            <ColegioPoloLogo size="md" />
          </button>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'catalog'
                  ? 'text-blue-400 font-bold border-b-2 border-blue-500'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Catálogo do Acervo</span>
            </button>

            <button
              onClick={() => onNavigate('my-loans')}
              className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'my-loans'
                  ? 'text-blue-400 font-bold border-b-2 border-blue-500'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Meus Empréstimos</span>
              {activeLoansCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white tabular-nums">
                  {activeLoansCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard'
                      ? 'text-amber-400 font-bold border-b-2 border-amber-500'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('admin-books')}
                  className={`transition-colors py-1 cursor-pointer ${
                    currentView === 'admin-books'
                      ? 'text-amber-400 font-bold border-b-2 border-amber-500'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Gerenciar Acervo</span>
                </button>

                <button
                  onClick={() => onNavigate('admin-loans')}
                  className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin-loans'
                      ? 'text-amber-400 font-bold border-b-2 border-amber-500'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Circulação Geral</span>
                  {overdueLoansCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white tabular-nums">
                      {overdueLoansCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('coordinator-pending')}
                  className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'coordinator-pending'
                      ? 'text-amber-400 font-bold border-b-2 border-amber-500'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cobranças & Pendências</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <button
                onClick={() => onNavigate('admin-books')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>+ Cadastrar Livro</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('my-loans')}
                className="px-3.5 py-2 bg-[#0F2444] hover:bg-[#16325C] text-blue-300 hover:text-white border border-blue-500/30 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Devolver Livro ({activeLoansCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-2.5 border-t border-slate-800 text-xs overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('catalog')}
              className={`whitespace-nowrap px-2 py-1 ${
                currentView === 'catalog' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              Acervo
            </button>

            <button
              onClick={() => onNavigate('my-loans')}
              className={`whitespace-nowrap px-2 py-1 ${
                currentView === 'my-loans' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              Meus Livros ({activeLoansCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
            >
              + Criar Conta
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
