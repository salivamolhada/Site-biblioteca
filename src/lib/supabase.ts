import { createClient } from '@supabase/supabase-js';
import { Book, Loan, User } from '../types';

// Read from env or local storage configuration
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('supabase_project_url') || '';
  const localKey = localStorage.getItem('supabase_anon_key') || '';
  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_project_url', url.trim());
  localStorage.setItem('supabase_anon_key', key.trim());
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.includes('supabase.co'));
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
};

export const SUPABASE_MIGRATION_SQL = `-- Schema completo para Supabase PostgreSQL
-- Cole e execute este script no "SQL Editor" do seu painel Supabase

-- 1. Tabela de Usuários (Alunos e Coordenadoras)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  matricula TEXT UNIQUE,
  avatar_url TEXT,
  turma TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Livros do Acervo
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  genre TEXT NOT NULL,
  publication_year INT NOT NULL,
  pages INT NOT NULL DEFAULT 150,
  description TEXT NOT NULL,
  cover_url TEXT,
  cover_gradient TEXT NOT NULL DEFAULT 'from-sky-800 via-indigo-950 to-slate-950',
  location TEXT,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de busca rápida
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_genre ON public.books(genre);

-- 3. Tabela de Empréstimos
CREATE TABLE IF NOT EXISTS public.loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrowed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  returned_at DATE,
  status TEXT NOT NULL DEFAULT 'em_dia',
  renewals INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book ON public.loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- Habilitar RLS (Row Level Security) para leitura pública e inserção controlada
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de livros" ON public.books FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de empréstimos" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de usuários" ON public.users FOR SELECT USING (true);
`;
