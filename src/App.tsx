/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Book, Loan } from './types';
import { seedUsers, seedBooks, seedLoans } from './data/seedData';
import { Header } from './components/Header';
import { StudentCatalog } from './components/StudentCatalog';
import { StudentLoans } from './components/StudentLoans';
import { CoordinatorPendingLoans } from './components/CoordinatorPendingLoans';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminBooksCrud } from './components/AdminBooksCrud';
import { AdminLoansManager } from './components/AdminLoansManager';
import { PrismaDocsModal } from './components/PrismaDocsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseModal } from './components/FirebaseModal';
import { ColegioPoloLogo } from './components/ColegioPoloLogo';
import { Lock, Flame, UserPlus, LogIn } from 'lucide-react';
import {
  testFirestoreConnection,
  subscribeToBooks,
  subscribeToLoans,
  subscribeToUsers,
  saveBookToFirestore,
  deleteBookFromFirestore,
  saveLoanToFirestore,
  saveUserToFirestore,
  seedInitialFirestoreData,
} from './lib/firebase';

export default function App() {
  // Users state with local storage fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('polo_library_users_v3');
    return saved ? JSON.parse(saved) : seedUsers;
  });

  // Current logged in student
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('polo_library_current_user_id_v3');
    const found = users.find((u) => u.id === savedId);
    return found || users[0];
  });

  // Admin authentication state (ADMIN / ADMIN)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('polo_admin_auth_v3') === 'true';
  });

  // Books state
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('polo_library_books_v3');
    return saved ? JSON.parse(saved) : seedBooks;
  });

  // Loans state
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('polo_library_loans_v3');
    return saved ? JSON.parse(saved) : seedLoans;
  });

  // Navigation state
  const [currentView, setCurrentView] = useState<string>(() => {
    return isAdmin ? 'admin-dashboard' : 'catalog';
  });

  // Modals state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);

  // Synchronize to localStorage as local cache
  useEffect(() => {
    localStorage.setItem('polo_library_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('polo_library_books_v3', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('polo_library_loans_v3', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('polo_library_current_user_id_v3', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('polo_admin_auth_v3', String(isAdmin));
  }, [isAdmin]);

  // Initialize Firebase connection, seed if empty, and subscribe to real-time updates
  useEffect(() => {
    let unsubBooks: (() => void) | undefined;
    let unsubLoans: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;

    const initFirebase = async () => {
      await testFirestoreConnection();
      await seedInitialFirestoreData(seedBooks, seedUsers, seedLoans);

      // Realtime listener for Books
      unsubBooks = subscribeToBooks((remoteBooks) => {
        if (remoteBooks.length > 0) {
          setBooks(remoteBooks);
        }
      });

      // Realtime listener for Loans
      unsubLoans = subscribeToLoans((remoteLoans) => {
        if (remoteLoans.length > 0) {
          setLoans(remoteLoans);
        }
      });

      // Realtime listener for Users
      unsubUsers = subscribeToUsers((remoteUsers) => {
        if (remoteUsers.length > 0) {
          setUsers(remoteUsers);
        }
      });
    };

    initFirebase().catch((err) => {
      console.warn('Firebase sync initialized in offline/resilient mode:', err);
    });

    return () => {
      if (unsubBooks) unsubBooks();
      if (unsubLoans) unsubLoans();
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // Protected navigation handler
  const handleNavigate = (view: string) => {
    const adminViews = ['admin-dashboard', 'admin-books', 'admin-loans', 'coordinator-pending'];
    if (adminViews.includes(view) && !isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // Open Auth Modal in either Login or Register mode
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  // Handle user login
  const handleLoginAs = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'coordinator' || user.role === 'admin') {
      setIsAdmin(true);
    }
  };

  // Handle registration of a new student
  const handleRegisterUser = async (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    try {
      await saveUserToFirestore(newUser);
    } catch (err) {
      console.warn('Saved user locally, syncing to Firebase:', err);
    }
  };

  // Admin login success (ADMIN / ADMIN)
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setCurrentView('catalog');
  };

  // Borrow a book (Student action)
  const handleBorrowBook = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    // Calculate due date (14 days from current date)
    const today = new Date('2026-10-26T04:30:00');
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      userId: currentUser.id,
      bookId: book.id,
      borrowedAt: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnedAt: null,
      status: 'em_dia',
      renewals: 0,
    };

    const updatedBook: Book = {
      ...book,
      availableCopies: Math.max(0, book.availableCopies - 1),
      updatedAt: new Date().toISOString(),
    };

    // Update local state immediately for responsive UI
    setBooks((prev) => prev.map((b) => (b.id === bookId ? updatedBook : b)));
    setLoans((prev) => [newLoan, ...prev]);

    // Persist to Firebase Firestore
    try {
      await saveLoanToFirestore(newLoan);
      await saveBookToFirestore(updatedBook);
    } catch (err) {
      console.warn('Persisted loan locally, Firebase sync:', err);
    }
  };

  // Renew a loan (+7 days)
  const handleRenewLoan = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.renewals >= 2) return;

    const currentDue = new Date(`${loan.dueDate}T00:00:00`);
    currentDue.setDate(currentDue.getDate() + 7);

    const updatedLoan: Loan = {
      ...loan,
      dueDate: currentDue.toISOString().split('T')[0],
      renewals: loan.renewals + 1,
      status: 'em_dia',
    };

    setLoans((prev) => prev.map((l) => (l.id === loanId ? updatedLoan : l)));

    try {
      await saveLoanToFirestore(updatedLoan);
    } catch (err) {
      console.warn('Persisted renewal locally, Firebase sync:', err);
    }
  };

  // Return a book (Can be executed by Student or Coordinator/Admin)
  const handleReturnBook = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.returnedAt) return;

    const returnDate = new Date('2026-10-26T04:30:00').toISOString().split('T')[0];

    const updatedLoan: Loan = {
      ...loan,
      returnedAt: returnDate,
      status: 'devolvido',
    };

    const book = books.find((b) => b.id === loan.bookId);
    const updatedBook: Book | null = book
      ? {
          ...book,
          availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
          updatedAt: new Date().toISOString(),
        }
      : null;

    setLoans((prev) => prev.map((l) => (l.id === loanId ? updatedLoan : l)));
    if (updatedBook) {
      setBooks((prev) => prev.map((b) => (b.id === loan.bookId ? updatedBook : b)));
    }

    try {
      await saveLoanToFirestore(updatedLoan);
      if (updatedBook) {
        await saveBookToFirestore(updatedBook);
      }
    } catch (err) {
      console.warn('Persisted return locally, Firebase sync:', err);
    }
  };

  // CRUD Books
  const handleAddBook = async (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    try {
      await saveBookToFirestore(newBook);
    } catch (err) {
      console.warn('Book saved locally, Firebase sync:', err);
    }
  };

  const handleUpdateBook = async (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    try {
      await saveBookToFirestore(updatedBook);
    } catch (err) {
      console.warn('Book updated locally, Firebase sync:', err);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    try {
      await deleteBookFromFirestore(bookId);
    } catch (err) {
      console.warn('Book deleted locally, Firebase sync:', err);
    }
  };

  // Counts for header badges
  const userActiveLoansCount = loans.filter(
    (l) => l.userId === currentUser.id && l.returnedAt === null
  ).length;

  const totalOverdueLoansCount = loans.filter(
    (l) => l.returnedAt === null && l.dueDate < '2026-10-26'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0E0C] text-stone-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Institutional Top Header */}
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenFirebase={() => setIsFirebaseOpen(true)}
        onOpenAuth={handleOpenAuth}
        currentView={currentView}
        onNavigate={handleNavigate}
        activeLoansCount={userActiveLoansCount}
        overdueLoansCount={totalOverdueLoansCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'catalog' && (
          <StudentCatalog
            books={books}
            userLoans={loans.filter((l) => l.userId === currentUser.id)}
            currentUser={currentUser}
            onBorrowBook={handleBorrowBook}
            onOpenMyLoans={() => setCurrentView('my-loans')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'my-loans' && (
          <StudentLoans
            loans={loans}
            books={books}
            currentUser={currentUser}
            onRenewLoan={handleRenewLoan}
            onReturnBook={handleReturnBook}
            onNavigateToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {/* Protected Admin Views */}
        {currentView === 'coordinator-pending' && (
          isAdmin ? (
            <CoordinatorPendingLoans
              loans={loans}
              books={books}
              users={users}
              onReturnBook={handleReturnBook}
            />
          ) : (
            <div className="bg-[#181715] border border-stone-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <Lock className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Acesso Restrito à Coordenadora</h2>
              <p className="text-xs text-stone-400">
                Esta área requer autenticação com as credenciais administrativas <strong>ADMIN</strong> / <strong>ADMIN</strong>.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Fazer Login de Administrador (ADMIN / ADMIN)
              </button>
            </div>
          )
        )}

        {currentView === 'admin-dashboard' && (
          isAdmin ? (
            <AdminDashboard
              books={books}
              loans={loans}
              users={users}
              onNavigate={handleNavigate}
              onReturnBook={handleReturnBook}
            />
          ) : (
            <div className="bg-[#181715] border border-stone-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <Lock className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Painel da Coordenadora</h2>
              <p className="text-xs text-stone-400">
                Acesse com usuário <strong>ADMIN</strong> e senha <strong>ADMIN</strong> para gerenciar o acervo e a circulação de livros.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Fazer Login de Administrador (ADMIN / ADMIN)
              </button>
            </div>
          )
        )}

        {currentView === 'admin-books' && (
          isAdmin ? (
            <AdminBooksCrud
              books={books}
              loans={loans}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
            />
          ) : (
            <div className="bg-[#181715] border border-stone-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <Lock className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Gestão do Acervo Bibliográfico</h2>
              <p className="text-xs text-stone-400">
                Faça login para cadastrar, editar ou remover títulos do Colégio Unidade Polo.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Fazer Login de Administrador (ADMIN / ADMIN)
              </button>
            </div>
          )
        )}

        {currentView === 'admin-loans' && (
          isAdmin ? (
            <AdminLoansManager
              loans={loans}
              books={books}
              users={users}
              onReturnBook={handleReturnBook}
            />
          ) : (
            <div className="bg-[#181715] border border-stone-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <Lock className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Circulação Geral de Empréstimos</h2>
              <p className="text-xs text-stone-400">
                Faça login para acompanhar o status de todos os exemplares da escola.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Fazer Login de Administrador (ADMIN / ADMIN)
              </button>
            </div>
          )
        )}

        {currentView === 'schema-docs' && <PrismaDocsModal />}
      </main>

      {/* Student / User Auth Modal (Login / Criar Nova Conta) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        availableUsers={users}
        onLoginAs={handleLoginAs}
        onRegisterUser={handleRegisterUser}
        initialMode={authInitialMode}
      />

      {/* Admin Login Modal (Fixed credentials: ADMIN / ADMIN) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Firebase Cloud Firestore Modal (Status & Architecture info, zero API key form) */}
      <FirebaseModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        booksCount={books.length}
        loansCount={loans.length}
        usersCount={users.length}
      />

      {/* Institutional School Footer */}
      <footer className="border-t border-stone-800 bg-[#11100E] text-stone-400 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <ColegioPoloLogo size="sm" showText={false} />
            <div>
              <p className="font-extrabold text-white text-sm">Colégio Unidade Polo</p>
              <p className="text-stone-400 text-xs">Biblioteca Escolar · Sistema de Gestão do Conhecimento</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <button
              onClick={() => setCurrentView('catalog')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Catálogo do Acervo
            </button>
            <button
              onClick={() => setCurrentView('my-loans')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Meus Empréstimos
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="hover:text-emerald-400 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Conta Aluno</span>
            </button>
            <button
              onClick={() => handleOpenAuth('login')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Aluno</span>
            </button>
            <button
              onClick={() => setIsFirebaseOpen(true)}
              className="hover:text-amber-400 text-amber-400 transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Firebase Firestore</span>
            </button>
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="hover:text-rose-400 text-rose-300 transition-colors cursor-pointer"
              >
                Encerrar Sessão ADMIN
              </button>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="hover:text-amber-300 text-amber-400 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin (ADMIN / ADMIN)</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
