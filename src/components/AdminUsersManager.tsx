import React, { useState } from 'react';
import { User, Loan, LoginActivity } from '../types';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowLeft,
  RefreshCw,
  Smartphone
} from 'lucide-react';

interface AdminUsersManagerProps {
  users: User[];
  loans: Loan[];
  logins: LoginActivity[];
  onBackToDashboard: () => void;
  onAddUser: (newUser: User) => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  users,
  loans,
  logins,
  onBackToDashboard,
  onAddUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTurma, setNewTurma] = useState('1º Ano A · Ensino Médio');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter users
  const students = users.filter((u) => u.role === 'student');
  const coordinators = users.filter((u) => u.role === 'coordinator' || u.role === 'admin');

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricula.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTurma = selectedTurma === 'todos' || student.turma === selectedTurma;
    return matchSearch && matchTurma;
  });

  const turmasList = Array.from(
    new Set(students.map((s) => s.turma).filter(Boolean))
  ) as string[];

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Preencha ao menos o nome completo e o e-mail do aluno.');
      return;
    }

    const exists = users.some(
      (u) => u.email.toLowerCase() === newEmail.trim().toLowerCase()
    );
    if (exists) {
      setFormError('Este e-mail institucional já está cadastrado.');
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newStudent: User = {
      id: `usr-student-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: 'student',
      matricula: `2026-POLO-${randomCode}`,
      turma: newTurma,
      phone: newPhone.trim() || '(11) 98765-0000',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newStudent);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6 text-stone-100">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBackToDashboard}
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao Painel da Coordenação</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Gestão de Alunos & Contas</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              Firebase Ativo · {users.length} usuários
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Contas criadas em qualquer dispositivo são sincronizadas em tempo real via Google Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Aluno</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181715] p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold block">Total de Alunos</span>
            <span className="text-2xl font-black text-white mt-1 font-mono">{students.length}</span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Cadastrados no Colégio</span>
          </div>
          <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl border border-emerald-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#181715] p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold block">Coordenação & Admin</span>
            <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{coordinators.length}</span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Equipe Bibliotecária</span>
          </div>
          <div className="p-3 bg-amber-950/40 text-amber-400 rounded-xl border border-amber-500/30">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#181715] p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold block">Acessos Registrados</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 font-mono">{logins.length}</span>
            <span className="text-[11px] text-stone-400 block mt-0.5">Logins monitorados na nuvem</span>
          </div>
          <div className="p-3 bg-stone-800/80 text-emerald-400 rounded-xl border border-stone-700">
            <Laptop className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181715] p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail institucional ou matrícula..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTurma}
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="todos">Todas as Turmas / Séries</option>
            {turmasList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#181715] border border-stone-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Alunos Cadastrados ({filteredStudents.length})</span>
          </h2>
          <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sincronia Firebase Firestore: Ativa</span>
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-stone-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Nenhum aluno localizado</p>
            <p className="text-xs text-stone-400">
              {searchTerm ? 'Tente ajustar os termos da busca.' : 'Cadastre o primeiro aluno usando o botão acima.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11100E] text-stone-400 text-[11px] uppercase tracking-wider font-semibold border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Aluno / Identificação</th>
                  <th className="py-3 px-4">Turma & Série</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Empréstimos Ativos</th>
                  <th className="py-3 px-4">Último Acesso / Dispositivo</th>
                  <th className="py-3 px-4 text-right">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {filteredStudents.map((student) => {
                  const studentLoans = loans.filter(
                    (l) => l.userId === student.id && l.returnedAt === null
                  );
                  const lastLogin = logins.find((lg) => lg.userId === student.id);

                  return (
                    <tr key={student.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {student.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{student.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              Matrícula: {student.matricula}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#11100E] border border-stone-700 text-stone-300 text-[11px]">
                          {student.turma || 'Ensino Regular'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <Mail className="w-3 h-3 text-stone-500" />
                          <span>{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                            <Phone className="w-3 h-3 text-stone-500" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {studentLoans.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{studentLoans.length} com o aluno</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-500">Nenhum livro retido</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {lastLogin ? (
                          <div className="text-[11px]">
                            <div className="flex items-center gap-1 text-emerald-400 font-medium">
                              <Smartphone className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{lastLogin.device}</span>
                            </div>
                            <span className="text-stone-500 text-[10px]">
                              {new Date(lastLogin.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-500">Sem registros</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-stone-400">
                        {student.createdAt || '2026-10'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181715] border border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Novo Cadastro de Aluno</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Andrey Santos"
                  className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">E-mail Institucional *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="aluno@polo.edu.br"
                  className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Turma / Série *</label>
                <select
                  value={newTurma}
                  onChange={(e) => setNewTurma(e.target.value)}
                  className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="6º Ano Fundamental">6º Ano Fundamental</option>
                  <option value="7º Ano Fundamental">7º Ano Fundamental</option>
                  <option value="8º Ano Fundamental">8º Ano Fundamental</option>
                  <option value="9º Ano Fundamental">9º Ano Fundamental</option>
                  <option value="1º Ano A · Ensino Médio">1º Ano A · Ensino Médio</option>
                  <option value="2º Ano B · Ensino Médio">2º Ano B · Ensino Médio</option>
                  <option value="3º Ano A · Ensino Médio">3º Ano A · Ensino Médio (Vestibular)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {formError && (
                <p className="text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#11100E] hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Salvar no Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
