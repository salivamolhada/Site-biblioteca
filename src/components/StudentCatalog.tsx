import React, { useState } from 'react';
import { Book, Loan, User } from '../types';
import { Search, BookMarked, CheckCircle2, AlertCircle, X, MapPin, Calendar, Hash, FileText, ArrowRight, BookOpen, UserPlus, Library, Bookmark } from 'lucide-react';

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
    'Ciências & Física',
    'História & Sociedade',
    'Distopia & Ficção',
    'Romance & Drama',
    'Infantojuvenil & Filosofia',
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
  const totalCopiesCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  const handleBorrowClick = (book: Book) => {
    if (book.availableCopies <= 0) {
      setToastMessage(`O exemplar "${book.title}" está indisponível no momento.`);
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
    setToastMessage(`Empréstimo de "${book.title}" confirmado com sucesso (Prazo: 14 dias).`);
    setTimeout(() => setToastMessage(null), 3500);
    if (selectedBookForDetails?.id === book.id) {
      setSelectedBookForDetails(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section: Institutional 2-Column Split */}
      <section className="rounded-2xl border border-stone-800 bg-[#181715] overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Ethos & Stats */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                Colégio Unidade Polo · Centro de Aprendizagem e Pesquisa
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Acervo Bibliográfico & Circulação Escolar
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal max-w-xl">
                Obras literárias para vestibulares Fuvest e Unicamp, tratados científicos e historiografia. Empréstimos automatizados com prazo padrão de 14 dias para alunos regularmente matriculados.
              </p>
            </div>

            {/* Metric Strip (Tabular Numerals) */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800/80">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums block">
                  {books.length}
                </span>
                <span className="text-xs text-stone-400 font-medium">Títulos no Catálogo</span>
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums block">
                  {totalAvailableCopies}
                </span>
                <span className="text-xs text-stone-400 font-medium">Disponíveis Agora</span>
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums block">
                  {totalCopiesCount}
                </span>
                <span className="text-xs text-stone-400 font-medium">Exemplares Físicos</span>
              </div>
            </div>

            {/* Reader Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-300 bg-[#11100E] p-3.5 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Leitor Ativo: <strong className="text-white">{currentUser.name}</strong> ({currentUser.turma || 'Ensino Médio'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMyLoans}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {activeLoansCount === 0
                    ? 'Nenhum livro pendente'
                    : `${activeLoansCount} empréstimo(s) em aberto`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Photography */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-stone-900 overflow-hidden">
            <img
              src="/src/assets/images/emerald_academic_library_1793013158399.jpg"
              alt="Salão Nobre da Biblioteca Escolar do Colégio Unidade Polo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181715] via-transparent to-transparent opacity-80 lg:hidden" />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs text-[11px] text-stone-300 font-medium border border-stone-800/80">
              Salão Nobre de Leitura · Polo
            </div>
          </div>
        </div>
      </section>

      {/* Search and Category Filter Deck */}
      <div className="bg-[#181715] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título, autor, gênero ou código ISBN..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#11100E] border border-stone-700/70 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-colors border flex items-center gap-2 justify-center cursor-pointer shrink-0 ${
              onlyAvailable
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#11100E] text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${onlyAvailable ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span>Apenas Disponíveis para Retirada</span>
          </button>
        </div>

        {/* Category Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer shrink-0 ${
                selectedGenre === g
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-[#11100E] text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Books Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-400 px-1">
          <span>
            Exibindo <strong className="text-white font-mono tabular-nums">{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'obra catalogada' : 'obras catalogadas'}
          </span>
          {selectedGenre !== 'Todos' && (
            <span>Gênero selecionado: <strong className="text-emerald-400">{selectedGenre}</strong></span>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-[#181715] border border-stone-800 rounded-2xl p-12 text-center space-y-3">
            <BookMarked className="w-10 h-10 text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum título corresponde aos critérios</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Verifique a ortografia ou redefina os filtros de gênero e disponibilidade.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
                setOnlyAvailable(false);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Restaurar Catálogo Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isAvailable = book.availableCopies > 0;
              const hasBorrowedThis = userLoans.some(
                (l) => l.bookId === book.id && l.returnedAt === null
              );
              const availabilityPercent = Math.round((book.availableCopies / book.totalCopies) * 100);

              return (
                <div
                  key={book.id}
                  className="bg-[#181715] border border-stone-800/90 hover:border-stone-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Book Cover Visual Frame */}
                  <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={`Capa do livro ${book.title}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${book.coverGradient} p-4 flex flex-col justify-end relative`}>
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10">
                          <p className="text-white font-serif font-bold text-base line-clamp-2">
                            {book.title}
                          </p>
                          <p className="text-stone-300 text-xs mt-0.5">
                            {book.author}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Content Area (Zero-Pill Metadata Discipline) */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Quiet Unboxed Metadata with · separator */}
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 flex-wrap">
                        <span>{book.genre}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{book.publicationYear}</span>
                        <span aria-hidden="true">·</span>
                        <span>{book.pages} p.</span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {book.title}
                      </h3>

                      <p className="text-xs text-stone-400 font-medium">
                        {book.author}
                      </p>

                      <p className="text-xs text-stone-300/90 line-clamp-2 leading-relaxed pt-1">
                        {book.description}
                      </p>
                    </div>

                    {/* Stock Indicator & Working Handlers */}
                    <div className="pt-3 border-t border-stone-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-stone-400 text-[11px]">Disponibilidade:</span>
                          <span className={`font-mono text-[11px] font-bold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {book.availableCopies} de {book.totalCopies} livres
                          </span>
                        </div>
                        <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${availabilityPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedBookForDetails(book)}
                          className="py-2 px-3 rounded-xl bg-[#11100E] hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 text-xs font-medium transition-colors cursor-pointer text-center"
                        >
                          Ver Detalhes
                        </button>

                        <button
                          onClick={() => handleBorrowClick(book)}
                          disabled={!isAvailable || hasBorrowedThis}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                            hasBorrowedThis
                              ? 'bg-stone-800 text-stone-400 border border-stone-700'
                              : isAvailable
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              : 'bg-stone-800/50 text-stone-500 border border-stone-800'
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
          <div className="relative w-full max-w-xl bg-[#181715] border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-8">
            <button
              onClick={() => setSelectedBookForDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 bg-[#11100E] flex items-start gap-4">
              {selectedBookForDetails.coverUrl && (
                <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-stone-700 shadow-md">
                  <img
                    src={selectedBookForDetails.coverUrl}
                    alt={selectedBookForDetails.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs text-emerald-400 font-medium">
                  {selectedBookForDetails.genre} · Publicado em {selectedBookForDetails.publicationYear}
                </div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {selectedBookForDetails.title}
                </h2>
                <p className="text-sm text-stone-300">
                  Por <strong className="text-white">{selectedBookForDetails.author}</strong>
                </p>
                <p className="text-xs text-stone-400 font-mono pt-1">
                  ISBN: {selectedBookForDetails.isbn} · {selectedBookForDetails.pages} páginas
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs sm:text-sm">
              {selectedBookForDetails.quote && (
                <blockquote className="p-3.5 rounded-xl bg-[#11100E] border border-stone-800 text-stone-300 italic">
                  {selectedBookForDetails.quote}
                </blockquote>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Sinopse da Obra</h4>
                <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
                  {selectedBookForDetails.description}
                </p>
              </div>

              {/* Location in Library */}
              <div className="p-3.5 rounded-xl bg-[#11100E] border border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Localização: <strong>{selectedBookForDetails.location}</strong></span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  {selectedBookForDetails.availableCopies} disponíveis
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-[#11100E] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBookForDetails(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Voltar ao Catálogo
              </button>

              <button
                type="button"
                onClick={() => handleBorrowClick(selectedBookForDetails)}
                disabled={selectedBookForDetails.availableCopies <= 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                {selectedBookForDetails.availableCopies > 0 ? 'Confirmar Empréstimo (14 Dias)' : 'Indisponível no Momento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
