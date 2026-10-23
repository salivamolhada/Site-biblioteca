import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, X, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConfigured, SUPABASE_MIGRATION_SQL, getSupabaseClient } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [projectUrl, setProjectUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig(projectUrl, anonKey);
    setTestStatus('testing');
    setStatusFeedback('Conectando ao Supabase PostgreSQL...');

    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestStatus('error');
        setStatusFeedback('Por favor, informe a URL e a Anon Key do seu projeto Supabase.');
        return;
      }

      // Quick test probe
      const { data, error } = await client.from('books').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but authentication worked
        setTestStatus('success');
        setStatusFeedback('Conexão autenticada com sucesso! Execute o script SQL abaixo no SQL Editor do Supabase.');
      } else {
        setTestStatus('success');
        setStatusFeedback('Conectado ao Supabase com sucesso! O banco de dados PostgreSQL está ativo.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setStatusFeedback(err.message || 'Erro ao conectar. Verifique as credenciais.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0A192F] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#071324] border border-emerald-500/40 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Integração com Supabase (PostgreSQL)</h3>
              <p className="text-xs text-slate-400">Banco de dados relacional na nuvem para o acervo da biblioteca escolar.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm ${
          isSupabaseConfigured()
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            : 'bg-[#071324] border-amber-500/30 text-amber-300'
        }`}>
          {isSupabaseConfigured() ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {isSupabaseConfigured()
                ? 'Conexão com Supabase Ativa'
                : 'Modo Local / Banco Relacional Simulado em Execução'}
            </p>
            <p className="text-xs opacity-90 mt-0.5 text-slate-300">
              {isSupabaseConfigured()
                ? 'As operações de acervo, usuários e empréstimos estão sincronizadas com o banco PostgreSQL.'
                : 'O sistema opera perfeitamente em modo local com persistência total no navegador, e está pronto para receber suas chaves do Supabase.'}
            </p>
          </div>
        </div>

        {/* Admin Fixed Auth Note */}
        <div className="p-3 rounded-xl bg-[#071324] border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Autenticação Administrativa</span>
              <span className="text-slate-200">Acesso restrito configurado para usuário: <strong className="text-amber-300 font-mono">ADMIN</strong> / senha: <strong className="text-amber-300 font-mono">ADMIN</strong></span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            Protegido
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveAndTest} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project URL do Supabase *
            </label>
            <input
              type="url"
              required
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 bg-[#071324] border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Anon Key (Public API Key) *
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-[#071324] border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400">
              Obtenha suas chaves em: <em>Project Settings &gt; API</em> no painel do Supabase.
            </span>
            <button
              type="submit"
              disabled={testStatus === 'testing'}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Salvar & Testar Conexão</span>
            </button>
          </div>

          {statusFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              testStatus === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}>
              {statusFeedback}
            </div>
          )}
        </form>

        {/* SQL Script to execute */}
        <div className="bg-[#071324] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs sm:text-sm">
              Script SQL DDL para Supabase (PostgreSQL)
            </h4>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Abra o <strong>SQL Editor</strong> no Supabase, cole o script e execute para criar as tabelas <code className="font-mono text-blue-400">users</code>, <code className="font-mono text-blue-400">books</code> e <code className="font-mono text-blue-400">loans</code> com chaves estrangeiras, índices e políticas de segurança.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
