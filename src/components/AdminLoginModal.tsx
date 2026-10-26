import React, { useState } from 'react';
import { Lock, UserCheck, X, Shield, ArrowRight, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Fixed credentials: ADMIN / ADMIN
      const u = username.trim().toUpperCase();
      const p = password.trim().toUpperCase();

      if (u === 'ADMIN' && p === 'ADMIN') {
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setError('Credenciais inválidas. Utilize usuário: ADMIN e senha: ADMIN.');
      }
    }, 300);
  };

  const handleFillDemo = () => {
    setUsername('ADMIN');
    setPassword('ADMIN');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#181715] border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Academic emerald & gold top line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#11100E] border border-emerald-500/30 flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>

            <ColegioPoloLogo size="sm" showText={false} className="mt-1" />

            <h2 className="text-xl font-bold text-white tracking-tight">
              Acesso da Coordenadora da Biblioteca
            </h2>
            <p className="text-xs text-stone-400 max-w-xs">
              Portal restrito para coordenação, gestão de acervo bibliográfico e controle de pendências.
            </p>
          </div>

          {/* Fixed Credentials Badge */}
          <div className="mb-5 p-3 rounded-xl bg-[#11100E] border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Credenciais Padrão</span>
                <span className="font-mono font-bold text-amber-300">ADMIN / ADMIN</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-[11px] transition-colors border border-emerald-500/40 cursor-pointer"
            >
              Preencher
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Usuário do Administrador
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ADMIN"
                className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ADMIN"
                className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-stone-800 text-center">
            <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autenticação de Segurança · Colégio Unidade Polo</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
