import React, { useState } from 'react';
import { Database, Code2, Copy, CheckCircle2, Server, Terminal, Shield } from 'lucide-react';

export const PrismaDocsModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'sql' | 'instructions'>('prisma');
  const [copied, setCopied] = useState(false);

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  LIBRARIAN
  ADMIN
}

enum LoanStatus {
  ON_TIME
  DUE_SOON
  OVERDUE
  RETURNED
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         Role      @default(STUDENT)
  matricula    String?   @unique
  avatarUrl    String?   @map("avatar_url")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  loans        Loan[]

  @@map("users")
}

model Book {
  id              String    @id @default(uuid())
  title           String
  author          String
  isbn            String    @unique
  genre           String
  publicationYear Int       @map("publication_year")
  description     String    @db.Text
  coverUrl        String?   @map("cover_url")
  location        String?
  totalCopies     Int       @default(1) @map("total_copies")
  availableCopies Int       @default(1) @map("available_copies")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  loans           Loan[]

  @@index([title])
  @@index([author])
  @@index([genre])
  @@map("books")
}

model Loan {
  id          String      @id @default(uuid())
  userId      String      @map("user_id")
  bookId      String      @map("book_id")
  borrowedAt  DateTime    @default(now()) @map("borrowed_at")
  dueDate     DateTime    @map("due_date")
  returnedAt  DateTime?   @map("returned_at")
  status      LoanStatus  @default(ON_TIME)
  renewals    Int         @default(0)

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  book        Book        @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([bookId])
  @@index([status])
  @@map("loans")
}`;

  const sqlDdlCode = `-- SQL DDL para PostgreSQL
CREATE TYPE "Role" AS ENUM ('STUDENT', 'LIBRARIAN', 'ADMIN');
CREATE TYPE "LoanStatus" AS ENUM ('ON_TIME', 'DUE_SOON', 'OVERDUE', 'RETURNED');

-- Tabela de Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role "Role" DEFAULT 'STUDENT',
  matricula VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Livros do Acervo
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(30) UNIQUE NOT NULL,
  genre VARCHAR(100) NOT NULL,
  publication_year INT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT,
  location VARCHAR(100),
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);

-- Tabela de Empréstimos com Foreign Keys
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status "LoanStatus" DEFAULT 'ON_TIME',
  renewals INT DEFAULT 0
);

CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_book ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-[#181715] rounded-2xl border border-stone-800 p-6 sm:p-8 shadow-xs space-y-4 text-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#11100E] text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Arquitetura de Banco de Dados Relacional
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                Prisma ORM, schemas PostgreSQL, chaves estrangeiras e índices otimizados.
              </p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(activeTab === 'prisma' ? prismaSchemaCode : sqlDdlCode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#11100E] hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold transition-colors self-start sm:self-center cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-stone-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('prisma')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'prisma'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            schema.prisma
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            PostgreSQL DDL (SQL Puro)
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Instruções de Instalação & Execução
          </button>
        </div>

        {/* Content */}
        {activeTab === 'prisma' && (
          <div className="relative">
            <pre className="p-4 bg-[#11100E] text-stone-200 border border-stone-800 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px]">
              {prismaSchemaCode}
            </pre>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="relative">
            <pre className="p-4 bg-[#11100E] text-stone-200 border border-stone-800 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px]">
              {sqlDdlCode}
            </pre>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
            <div className="p-4 bg-[#11100E] rounded-xl border border-stone-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Como rodar as migrações no PostgreSQL local ou em nuvem</span>
              </h4>
              <p className="text-xs text-stone-400">
                1. Configure sua variável de ambiente no arquivo <code className="font-mono bg-[#181715] px-1.5 py-0.5 rounded border border-stone-700">.env</code>:
              </p>
              <pre className="p-2.5 bg-black/60 text-emerald-300 rounded text-xs font-mono border border-stone-800">
                DATABASE_URL="postgresql://usuario:senha@localhost:5432/biblioteca_db?schema=public"
              </pre>
              <p className="text-xs text-stone-400 pt-1">
                2. Execute o comando de migração do Prisma:
              </p>
              <pre className="p-2.5 bg-black/60 text-emerald-300 rounded text-xs font-mono border border-stone-800">
                npx prisma migrate dev --name init
              </pre>
              <p className="text-xs text-stone-400 pt-1">
                3. Popule o banco com o seed de dados escolares:
              </p>
              <pre className="p-2.5 bg-black/60 text-emerald-300 rounded text-xs font-mono border border-stone-800">
                npx prisma db seed
              </pre>
            </div>

            <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs text-stone-300">
              <h5 className="font-bold text-emerald-300 text-sm">Garantias de Integridade Relacional</h5>
              <p>• <strong>Índices:</strong> Criados em <code className="font-mono">title</code>, <code className="font-mono">author</code>, <code className="font-mono">genre</code> e nas chaves estrangeiras <code className="font-mono">user_id</code> e <code className="font-mono">book_id</code> para buscas sub-milissegundo.</p>
              <p>• <strong>Controle Concorrente:</strong> Cada empréstimo decrementa atomicamente o campo <code className="font-mono">available_copies</code> e cada devolução o incrementa.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
