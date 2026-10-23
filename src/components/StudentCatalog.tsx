import React, { useState } from 'react';
import { Book, Loan, User } from '../types';
import { Search, BookMarked, CheckCircle2, AlertCircle, X, MapPin, Calendar, Hash, FileText, ArrowRight, Sparkles, BookOpen, UserPlus, LogIn } from 'lucide-react';
import { ColegioPoloLogo } from './ColegioPoloLogo';

interface StudentCatalogProps {
  books: Book[];
  userLoans: Loan[];
  currentUser: User;
  onBorrowBook: (bookId: string) => void;
  onOpenMyLoans: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const StudentCatalog: React.FC<StudentCatalogProps> = ({
  books,
  userLoans,
  currentUser,
  onBorrowBook,
  onOpenMyLoans,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const genres = [
    'Todos',
    'Clássicos Brasileiros',
    'Distopia & Ficção',
    'Romance & Drama',
    'Infantojuvenil & Filosofia',
    'Biografia & Relato',
    'Ficção & Aventura',
  ];

  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'Todos' || book.genre.includes(selectedGenre);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q);
    const matchesAvailability = onlyAvailable ? book.availableCopies > 0 : true;

    return matchesGenre && matchesSearch && matchesAvailability;
  });

  const activeLoansCount = userLoans.filter((l) => l.returnedAt === null).length;

  const handleBorrowClick = (book: Book) => {
    if (book.availableCopies <= 0) {
      setToastMessage(`O exemplar "${book.title}" está esgotado no momento.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const alreadyHasLoan = userLoans.some(
      (l) => l.bookId === book.id && l.returnedAt === null
    );

    if (alreadyHasLoan) {
      setToastMessage(`Você já possui um exemplar ativo de "${book.title}".`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    onBorrowBook(book.id);
    setToastMessage(`Empréstimo de "${book.title}" registrado com sucesso por 14 dias.`);
    setTimeout(() => setToastMessage(null), 3500);
    if (selectedBookForDetails?.id === book.id) {
      setSelectedBookForDetails(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section: Institutional, High Prestige School Library */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#0D2240] to-[#0A192F] border border-slate-800 shadow-xl p-6 sm:p-10">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071324] border border-blue-500/30 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Colégio Unidade Polo · Acervo Central do Conhecimento</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Biblioteca Escolar & Acervo Acadêmico
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Consulte obras literárias, leituras obrigatórias para vestibulares e publicações científicas. Faça empréstimos com 1 clique e acompanhe suas devoluções de forma transparente.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#071324] border border-slate-800">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span><strong className="text-white font-bold">{books.length}</strong> Obras Cadastradas</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#071324] border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white font-bold">{books.reduce((acc, b) => acc + b.availableCopies, 0)}</strong> Exemplares Disponíveis</span>
              </div>

              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Novo Aluno</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Box for Reader */}
          <div className="w-full lg:w-auto bg-[#071324]/90 border border-slate-800 rounded-2xl p-5 shrink-0 flex flex-col gap-3.5 min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Situação do Leitor</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                {activeLoansCount} Ativos
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-white">Aluno(a): {currentUser.name}</p>
              <p className="text-[11px] text-slate-400">Matrícula: {currentUser.matricula}</p>
            </div>

            <p className="text-xs text-slate-300">
              {activeLoansCount === 0
                ? 'Nenhum exemplar pendente no momento.'
                : `Você possui ${activeLoansCount} livro(s) em prazo de leitura.`}
            </p>

            <button
              onClick={onOpenMyLoans}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Meus Prazos e Devoluções</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0A192F] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, autor, gênero ou código ISBN..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#071324] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 justify-center cursor-pointer ${
              onlyAvailable
                ? 'bg-blue-950/60 text-blue-300 border-blue-500/50'
                : 'bg-[#071324] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${onlyAvailable ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>Apenas Livros Disponíveis</span>
          </button>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-medium mr-1">Gênero:</span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedGenre === g
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-[#071324] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Exibindo <strong className="text-white">{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'livro' : 'livros'} no catálogo
          </span>
          {selectedGenre !== 'Todos' && (
            <span>Filtro ativo: <strong className="text-blue-400">{selectedGenre}</strong></span>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <BookMarked className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum livro encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Não encontramos nenhum exemplar com os critérios selecionados. Tente ajustar o termo de busca ou limpar os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
                setOnlyAvailable(false);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBooks.map((book) => {
              const isAvailable = book.availableCopies > 0;
              const hasBorrowedThis = userLoans.some(
                (l) => l.bookId === book.id && l.returnedAt === null
              );

              return (
                <div
                  key={book.id}
                  className="bg-[#0A192F] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col group"
                >
                  {/* Book Spine / Cover Header */}
                  <div className={`h-36 bg-gradient-to-br ${book.coverGradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 border border-white/10 backdrop-blur-xs">
                        {book.genre}
                      </span>
                      <span className="text-[10px] text-slate-200 font-mono bg-black/40 px-1.5 py-0.5 rounded">
                        {book.publicationYear}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <p className="text-white font-serif font-bold text-base leading-snug drop-shadow-sm line-clamp-2">
                        {book.title}
                      </p>
                      <p className="text-slate-300 text-xs font-medium drop-shadow-xs line-clamp-1 mt-0.5">
                        {book.author}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span className="font-mono text-slate-400">{book.isbn}</span>
                        <span className="text-slate-400">{book.pages} págs</span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="pt-2 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Disponibilidade:</span>
                        {isAvailable ? (
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {book.availableCopies} de {book.totalCopies} livres
                          </span>
                        ) : (
                          <span className="font-bold text-rose-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Indisponível (0/{book.totalCopies})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedBookForDetails(book)}
                          className="py-2 px-3 rounded-xl bg-[#071324] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          Ver Detalhes
                        </button>

                        <button
                          onClick={() => handleBorrowClick(book)}
                          disabled={!isAvailable || hasBorrowedThis}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                            hasBorrowedThis
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : isAvailable
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                              : 'bg-slate-800/60 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {hasBorrowedThis ? (
                            <span>Em Mãos ✓</span>
                          ) : isAvailable ? (
                            <span>Emprestar</span>
                          ) : (
                            <span>Esgotado</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0A192F] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <button
              onClick={() => setSelectedBookForDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Cover */}
            <div className={`p-6 bg-gradient-to-br ${selectedBookForDetails.coverGradient} relative`}>
              <div className="relative z-10 max-w-md">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 border border-white/10 uppercase tracking-wider">
                  {selectedBookForDetails.genre}
                </span>
                <h2 className="text-2xl font-bold font-serif text-white mt-2 leading-tight">
                  {selectedBookForDetails.title}
                </h2>
                <p className="text-slate-200 text-sm mt-1">
                  Por <strong className="text-white">{selectedBookForDetails.author}</strong>
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold block mb-1">Sinopse da Obra</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedBookForDetails.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-[#071324] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Ano de Publicação</span>
                  <span className="font-bold text-white text-sm">{selectedBookForDetails.publicationYear}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#071324] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Número de Páginas</span>
                  <span className="font-bold text-white text-sm">{selectedBookForDetails.pages} páginas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#071324] border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px]">Código ISBN</span>
                  <span className="font-mono font-bold text-blue-400 text-xs">{selectedBookForDetails.isbn}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#071324] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Localização no Acervo Escolar</span>
                  <span className="font-semibold text-slate-200">{selectedBookForDetails.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Exemplares</span>
                  <span className="font-bold text-emerald-400">
                    {selectedBookForDetails.availableCopies} de {selectedBookForDetails.totalCopies} livres
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setSelectedBookForDetails(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#071324] hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold cursor-pointer text-center"
                >
                  Voltar ao Catálogo
                </button>
                <button
                  onClick={() => handleBorrowClick(selectedBookForDetails)}
                  disabled={selectedBookForDetails.availableCopies <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 text-center"
                >
                  {selectedBookForDetails.availableCopies > 0 ? 'Emprestar Este Livro' : 'Exemplares Esgotados'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
