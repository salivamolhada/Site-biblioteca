import React, { useState } from 'react';
import { Book, Loan } from '../types';
import { Plus, Search, Edit2, Trash2, CheckCircle2, AlertCircle, X, BookOpen, Layers } from 'lucide-react';

interface AdminBooksCrudProps {
  books: Book[];
  loans: Loan[];
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
}

export const AdminBooksCrud: React.FC<AdminBooksCrudProps> = ({
  books,
  loans,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}) => {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('Clássicos Brasileiros');
  const [publicationYear, setPublicationYear] = useState('2020');
  const [pages, setPages] = useState('200');
  const [totalCopies, setTotalCopies] = useState('4');
  const [location, setLocation] = useState('Estante 1 · Prateleira A');
  const [description, setDescription] = useState('');
  const [gradientTheme, setGradientTheme] = useState('from-emerald-800 via-stone-900 to-stone-950');

  const gradientOptions = [
    { label: 'Esmeralda Nobre', value: 'from-emerald-800 via-stone-900 to-stone-950' },
    { label: 'Âmbar Dourado', value: 'from-amber-700 via-stone-900 to-stone-950' },
    { label: 'Mogno Clássico', value: 'from-stone-700 via-stone-900 to-stone-950' },
    { label: 'Vinho & Rubi', value: 'from-red-900 via-neutral-900 to-stone-950' },
    { label: 'Ardósia & Bronze', value: 'from-zinc-700 via-stone-900 to-stone-950' },
  ];

  const filteredBooks = books.filter((b) => {
    const matchesGenre = genreFilter === 'Todos' || b.genre === genreFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });

  const handleOpenCreate = () => {
    setTitle('');
    setAuthor('');
    setIsbn(`978-85-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1 + Math.random() * 9)}`);
    setGenre('Clássicos Brasileiros');
    setPublicationYear('2022');
    setPages('220');
    setTotalCopies('4');
    setLocation('Estante 2 · Prateleira B');
    setDescription('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setGenre(book.genre);
    setPublicationYear(String(book.publicationYear));
    setPages(String(book.pages));
    setTotalCopies(String(book.totalCopies));
    setLocation(book.location);
    setDescription(book.description);
    setGradientTheme(book.coverGradient);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseInt(totalCopies, 10) || 1;

    if (editingBook) {
      const activeLoansForBook = loans.filter((l) => l.bookId === editingBook.id && l.returnedAt === null).length;
      const newAvailable = Math.max(0, parsedTotal - activeLoansForBook);

      const updated: Book = {
        ...editingBook,
        title,
        author,
        isbn,
        genre,
        publicationYear: parseInt(publicationYear, 10) || 2020,
        pages: parseInt(pages, 10) || 200,
        totalCopies: parsedTotal,
        availableCopies: newAvailable,
        location,
        description,
        coverGradient: gradientTheme,
        updatedAt: new Date().toISOString(),
      };

      onUpdateBook(updated);
      setEditingBook(null);
      setToastMessage(`Livro "${title}" atualizado com sucesso!`);
    } else {
      const newBook: Book = {
        id: `book-${Date.now()}`,
        title,
        author,
        isbn,
        genre,
        publicationYear: parseInt(publicationYear, 10) || 2020,
        pages: parseInt(pages, 10) || 200,
        totalCopies: parsedTotal,
        availableCopies: parsedTotal,
        location,
        description: description || 'Obra literária catalogada na Biblioteca do Colégio Unidade Polo.',
        coverGradient: gradientTheme,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      onAddBook(newBook);
      setShowAddModal(false);
      setToastMessage(`Livro "${title}" cadastrado com sucesso!`);
    }

    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDelete = (book: Book) => {
    const hasActiveLoan = loans.some((l) => l.bookId === book.id && l.returnedAt === null);
    if (hasActiveLoan) {
      setToastMessage(`Não é possível excluir "${book.title}" pois há exemplares emprestados atualmente.`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    onDeleteBook(book.id);
    setToastMessage(`Livro "${book.title}" removido do acervo.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 text-stone-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 font-semibold">
              Módulo de Acervo
            </span>
            <span className="text-xs text-stone-400">Total: <strong className="text-white">{books.length} títulos</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão do Acervo Bibliográfico</h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Cadastre novos títulos, controle a quantidade de exemplares físicos e mantenha o catálogo do Colégio Unidade Polo atualizado.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 self-start sm:self-center cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Livro</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-[#181715] p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor ou ISBN..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 whitespace-nowrap">Filtrar por:</span>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-3 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="Todos">Todos os Gêneros</option>
            <option value="Clássicos Brasileiros">Clássicos Brasileiros</option>
            <option value="Distopia & Ficção">Distopia & Ficção</option>
            <option value="Romance & Drama">Romance & Drama</option>
            <option value="Infantojuvenil & Filosofia">Infantojuvenil & Filosofia</option>
            <option value="Biografia & Relato">Biografia & Relato</option>
            <option value="Ficção & Aventura">Ficção & Aventura</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-[#181715] border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11100E] text-stone-400 font-semibold border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Título & Autor</th>
                <th className="py-3 px-4">Gênero</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-center">Exemplares</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <tr key={book.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-sm font-serif">{book.title}</p>
                      <p className="text-stone-400 text-xs">{book.author} · {book.publicationYear}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#11100E] text-emerald-300 border border-stone-700 text-[11px] font-medium">
                        {book.genre}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-400">{book.isbn}</td>
                    <td className="py-3 px-4 text-stone-300">{book.location}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold tabular-nums ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 rounded-lg bg-[#11100E] hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors inline-block cursor-pointer"
                        title="Editar livro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-200 border border-rose-500/40 transition-colors inline-block cursor-pointer"
                        title="Excluir livro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#181715] border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-stone-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white">
                {editingBook ? `Editar Obra: ${editingBook.title}` : 'Cadastrar Novo Livro no Acervo'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBook(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Título da Obra *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Dom Casmurro"
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Autor(a) *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ex: Machado de Assis"
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Código ISBN *</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Gênero Literário</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Clássicos Brasileiros">Clássicos Brasileiros</option>
                    <option value="Distopia & Ficção">Distopia & Ficção</option>
                    <option value="Romance & Drama">Romance & Drama</option>
                    <option value="Infantojuvenil & Filosofia">Infantojuvenil & Filosofia</option>
                    <option value="Biografia & Relato">Biografia & Relato</option>
                    <option value="Ficção & Aventura">Ficção & Aventura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Ano de Publicação</label>
                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Número de Páginas</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Total de Exemplares Físicos *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Localização no Acervo</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Estante 1 · Prateleira A"
                    className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Sinopse da Obra</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumo bibliográfico da obra para orientação dos alunos..."
                  className="w-full px-3 py-2 bg-[#11100E] border border-stone-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Tema Visual da Capa</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gradientOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setGradientTheme(opt.value)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                        gradientTheme === opt.value
                          ? 'border-emerald-500 bg-emerald-950/40'
                          : 'border-stone-800 bg-[#11100E]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${opt.value}`} />
                      <span className="text-[11px] text-stone-200 truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBook(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#11100E] hover:bg-stone-800 text-stone-300 border border-stone-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingBook ? 'Salvar Alterações' : 'Cadastrar no Acervo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
