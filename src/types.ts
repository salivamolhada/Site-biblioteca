export type UserRole = 'student' | 'coordinator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matricula: string;
  avatarUrl?: string;
  avatarCharacter?: 'goku' | 'vegeta' | 'gohan' | 'trunks' | 'piccolo';
  turma?: string;
  phone?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publicationYear: number;
  description: string;
  quote?: string;
  badge?: string;
  coverUrl?: string;
  coverGradient: string;
  location: string;
  totalCopies: number;
  availableCopies: number;
  pages: number;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 'em_dia' | 'vence_em_breve' | 'atrasado' | 'devolvido';

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: string; // ISO date string YYYY-MM-DD
  dueDate: string;    // ISO date string YYYY-MM-DD
  returnedAt?: string | null;
  status: LoanStatus;
  renewals: number;
}

export interface LibraryMetrics {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  activeUsers: number;
}
