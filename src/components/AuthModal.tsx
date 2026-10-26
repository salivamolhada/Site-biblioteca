import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, X, LogIn, Lock, Mail, UserPlus, Phone, GraduationCap, CheckCircle2, BookOpen, AlertCircle } from 'lucide-react';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  onLoginAs: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  onLoginAs,
  onRegisterUser,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginRoleTab, setLoginRoleTab] = useState<'student' | 'coordinator'>('student');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoginError(null);
      setRegisterError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTurma, setRegTurma] = useState('1º Ano A · Ensino Médio');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const coordinatorUser = availableUsers.find((u) => u.role === 'coordinator' || u.role === 'admin') || availableUsers[0];
  const studentUser = availableUsers.find((u) => u.role === 'student') || availableUsers[0];

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const found = availableUsers.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (found) {
      onLoginAs(found);
      onClose();
    } else {
      setLoginError('E-mail institucional não localizado no registro do Colégio Unidade Polo.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!regName.trim() || !regEmail.trim()) {
      setRegisterError('Por favor, preencha o nome completo e o e-mail do aluno.');
      return;
    }

    if (regPassword.length < 4) {
      setRegisterError('A senha de acesso deve ter pelo menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegisterError('As senhas digitadas não conferem.');
      return;
    }

    const existingUser = availableUsers.find((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existingUser) {
      setRegisterError('Este e-mail institucional já possui cadastro ativo.');
      return;
    }

    // Auto-generate school registration number
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newMatricula = `2026-POLO-${randomCode}`;

    const newUser: User = {
      id: `usr-student-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      role: 'student',
      matricula: newMatricula,
      turma: regTurma,
      phone: regPhone.trim() || '(11) 98765-0000',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRegisterUser(newUser);
    setSuccessMsg(`Cadastro realizado com sucesso! Matrícula gerada: ${newMatricula}`);
    setTimeout(() => {
      onLoginAs(newUser);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181715] border border-stone-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-stone-100 relative">
        {/* Header with Colégio Polo Logo & Close Button */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <ColegioPoloLogo size="sm" />
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Login vs Criar Conta */}
        <div className="grid grid-cols-2 gap-2 bg-[#11100E] p-1.5 rounded-2xl text-xs font-semibold border border-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
              setRegisterError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Acessar Conta</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLoginError(null);
              setRegisterError(null);
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* ================= LOGIN MODE ================= */
          <div className="space-y-5">
            {/* Role Tab */}
            <div className="grid grid-cols-2 gap-2 bg-[#11100E] p-1 rounded-xl text-xs font-semibold border border-stone-800">
              <button
                type="button"
                onClick={() => setLoginRoleTab('student')}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRoleTab === 'student'
                    ? 'bg-stone-800 text-white font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Aluno(a)</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginRoleTab('coordinator')}
                className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRoleTab === 'coordinator'
                    ? 'bg-stone-800 text-amber-300 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Coordenadora</span>
              </button>
            </div>

            {/* Quick 1-click Presets for Fast Testing */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Acesso de Teste Rápido (1 Clique):
              </span>

              {loginRoleTab === 'student' ? (
                <button
                  type="button"
                  onClick={() => {
                    onLoginAs(studentUser);
                    onClose();
                  }}
                  className="w-full p-3.5 bg-[#11100E] hover:bg-stone-800/80 border border-stone-800 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/25 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                      LO
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{studentUser.name}</p>
                      <p className="text-[11px] text-stone-400">{studentUser.turma} · Matrícula: {studentUser.matricula}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Entrar →
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onLoginAs(coordinatorUser);
                    onClose();
                  }}
                  className="w-full p-3.5 bg-[#11100E] hover:bg-stone-800/80 border border-stone-800 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                      MC
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{coordinatorUser.name}</p>
                      <p className="text-[11px] text-amber-400">Coordenadora da Biblioteca (Gestão & Cobrança)</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                    Entrar →
                  </span>
                </button>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-stone-800" />
              <span className="absolute bg-[#181715] px-3 text-[10px] uppercase font-bold tracking-widest text-stone-500">
                ou acesse com seu e-mail
              </span>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">E-mail Institucional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={loginRoleTab === 'student' ? 'aluno@escola.edu.br' : 'coordenadora@escola.edu.br'}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>
            </form>
          </div>
        ) : (
          /* ================= REGISTER MODE ================= */
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Nome Completo do Aluno *</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Gabriela Medeiros Silva"
                className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">E-mail Institucional *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aluno@escola.edu.br"
                  className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Série / Turma no Colégio Unidade Polo *</label>
              <select
                value={regTurma}
                onChange={(e) => setRegTurma(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
              >
                <option value="6º Ano Fundamental">6º Ano · Ensino Fundamental</option>
                <option value="7º Ano Fundamental">7º Ano · Ensino Fundamental</option>
                <option value="8º Ano Fundamental">8º Ano · Ensino Fundamental</option>
                <option value="9º Ano Fundamental">9º Ano · Ensino Fundamental</option>
                <option value="1º Ano A · Ensino Médio">1º Ano A · Ensino Médio</option>
                <option value="2º Ano B · Ensino Médio">2º Ano B · Ensino Médio</option>
                <option value="3º Ano A · Ensino Médio">3º Ano A · Ensino Médio (Vestibular)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Criar Senha *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Confirmar Senha *</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full px-3.5 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {registerError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {registerError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Concluir Cadastro & Acessar Biblioteca</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
