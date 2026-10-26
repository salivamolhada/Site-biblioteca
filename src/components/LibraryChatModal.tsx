import React, { useState, useEffect, useRef } from 'react';
import { User, Book, Loan, ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  X,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCheck,
  Check,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  Search,
  BellRing
} from 'lucide-react';

interface LibraryChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isAdmin: boolean;
  users: User[];
  books: Book[];
  loans: Loan[];
  messages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => void;
  onMarkAsRead: (messageId: string) => void;
  initialTargetUserId?: string | null;
  initialBookId?: string | null;
}

export const LibraryChatModal: React.FC<LibraryChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAdmin,
  users,
  books,
  loans,
  messages,
  onSendMessage,
  onMarkAsRead,
  initialTargetUserId = null,
  initialBookId = null,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(initialBookId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter students
  const students = users.filter((u) => u.role === 'student');

  // Overdue loans map for students
  const overdueMap: Record<string, Loan[]> = {};
  loans
    .filter((l) => l.returnedAt === null && l.dueDate < '2026-10-26')
    .forEach((l) => {
      if (!overdueMap[l.userId]) overdueMap[l.userId] = [];
      overdueMap[l.userId].push(l);
    });

  // Active loans map for students
  const activeLoansMap: Record<string, Loan[]> = {};
  loans
    .filter((l) => l.returnedAt === null)
    .forEach((l) => {
      if (!activeLoansMap[l.userId]) activeLoansMap[l.userId] = [];
      activeLoansMap[l.userId].push(l);
    });

  // Determine current active chat partner
  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        if (initialTargetUserId && students.some((s) => s.id === initialTargetUserId)) {
          setSelectedStudentId(initialTargetUserId);
        } else if (!selectedStudentId && students.length > 0) {
          // Default to student with overdue loans if any, else first student
          const studentWithOverdue = students.find((s) => overdueMap[s.id]?.length > 0);
          setSelectedStudentId(studentWithOverdue ? studentWithOverdue.id : students[0].id);
        }
      } else {
        // If logged in as student, partner is always the coordinator/admin
        setSelectedStudentId(currentUser.id);
      }

      if (initialBookId) {
        setSelectedBookId(initialBookId);
      }
    }
  }, [isOpen, initialTargetUserId, initialBookId, isAdmin, currentUser.id]);

  // Scroll to bottom on message change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedStudentId, isOpen]);

  // Mark unread messages as read when opening conversation
  useEffect(() => {
    if (isOpen) {
      const targetId = isAdmin ? selectedStudentId : currentUser.id;
      const unreadForMe = messages.filter(
        (m) =>
          m.recipientId === (isAdmin ? 'coordinator' : currentUser.id) &&
          !m.read &&
          (isAdmin ? m.senderId === selectedStudentId : true)
      );

      unreadForMe.forEach((m) => onMarkAsRead(m.id));
    }
  }, [isOpen, messages, selectedStudentId, isAdmin, currentUser.id]);

  if (!isOpen) return null;

  const currentPartner = isAdmin
    ? students.find((s) => s.id === selectedStudentId) || students[0]
    : currentUser;

  // Overdue loans for the selected student
  const studentOverdueLoans = currentPartner ? overdueMap[currentPartner.id] || [] : [];
  const studentActiveLoans = currentPartner ? activeLoansMap[currentPartner.id] || [] : [];

  // Associated book for current overdue reminder
  const currentLoanDiscussed = selectedBookId
    ? studentActiveLoans.find((l) => l.bookId === selectedBookId) || studentOverdueLoans[0]
    : studentOverdueLoans[0] || studentActiveLoans[0];

  const currentBookDiscussed = currentLoanDiscussed
    ? books.find((b) => b.id === currentLoanDiscussed.bookId)
    : null;

  // Filter messages between current student and coordinator
  const conversationMessages = messages.filter((m) => {
    const studentId = isAdmin ? selectedStudentId : currentUser.id;
    return (
      (m.senderId === studentId && (m.recipientId === 'coordinator' || m.recipientId === 'admin')) ||
      ((m.senderId === 'coordinator' || m.senderId === 'admin') && m.recipientId === studentId) ||
      m.recipientId === studentId ||
      m.senderId === studentId
    );
  });

  const handleSend = (textToSend?: string, isUrgent = false) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !currentPartner) return;

    if (isAdmin) {
      onSendMessage({
        senderId: 'coordinator',
        senderName: 'Coordenação da Biblioteca',
        senderRole: 'coordinator',
        recipientId: currentPartner.id,
        recipientName: currentPartner.name,
        bookId: currentBookDiscussed?.id,
        bookTitle: currentBookDiscussed?.title,
        text,
        isUrgentNotice: isUrgent || studentOverdueLoans.length > 0,
      });
    } else {
      onSendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'student',
        recipientId: 'coordinator',
        recipientName: 'Coordenação da Biblioteca',
        bookId: currentBookDiscussed?.id,
        bookTitle: currentBookDiscussed?.title,
        text,
      });
    }

    setInputMessage('');
  };

  // Quick collection notice templates for the Coordinator
  const quickNoticeTemplates = currentBookDiscussed
    ? [
        {
          label: '🚨 Cobrança de Atraso',
          text: `Olá ${currentPartner?.name.split(' ')[0]}! Consta em nosso sistema que o livro "${currentBookDiscussed.title}" está com prazo de devolução vencido (vencimento: ${currentLoanDiscussed?.dueDate}). Solicitamos a devolução do exemplar ou renovação o quanto antes.`,
          urgent: true,
        },
        {
          label: '📅 Prazo até Amanhã',
          text: `Aviso da Coordenação: Por favor, traga o livro "${currentBookDiscussed.title}" até amanhã às 17h para a biblioteca para evitar suspensão de novos empréstimos.`,
          urgent: true,
        },
        {
          label: 'ℹ️ Lembrete Amigável',
          text: `Olá ${currentPartner?.name.split(' ')[0]}, tudo bem? Você ainda está lendo "${currentBookDiscussed.title}"? Caso precise de mais tempo, você pode solicitar a renovação no sistema.`,
          urgent: false,
        },
      ]
    : [
        {
          label: '🔔 Aviso de Regularização',
          text: `Olá ${currentPartner?.name.split(' ')[0]}! Entramos em contato para verificar a regularização dos seus empréstimos pendentes na biblioteca escolar.`,
          urgent: true,
        },
      ];

  // Quick reply options for Student
  const studentQuickReplies = [
    'Professora, vou levar o livro amanhã de manhã!',
    'Estou terminando de ler hoje e já entrego na biblioteca.',
    'Consigo renovar o livro por mais alguns dias?',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-[#181715] border border-stone-700 rounded-3xl max-w-4xl w-full h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-stone-800 bg-[#12110F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Canal Direto de Cobrança & Mensagens</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                  Tempo Real
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {isAdmin
                  ? 'Envie lembretes e cobranças de livros em atraso diretamente aos alunos'
                  : 'Fale diretamente com a Coordenação da Biblioteca Escolar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (Only visible to Admin to pick student) */}
          {isAdmin && (
            <div className="w-64 sm:w-72 border-r border-stone-800 bg-[#11100E] flex flex-col shrink-0">
              <div className="p-3 border-b border-stone-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Filtrar aluno..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#181715] border border-stone-700/80 rounded-lg text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 p-1">
                {students
                  .filter((s) =>
                    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                    s.matricula.toLowerCase().includes(searchStudent.toLowerCase())
                  )
                  .sort((a, b) => {
                    const aOverdue = (overdueMap[a.id]?.length || 0);
                    const bOverdue = (overdueMap[b.id]?.length || 0);
                    return bOverdue - aOverdue; // Prioritize overdue students at top
                  })
                  .map((student) => {
                    const hasOverdue = (overdueMap[student.id]?.length || 0) > 0;
                    const isSelected = student.id === selectedStudentId;

                    return (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border border-emerald-500/40 text-white'
                            : 'hover:bg-stone-800/50 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            hasOverdue
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-stone-800 text-stone-300'
                          }`}>
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate text-white">{student.name}</p>
                            <p className="text-[10px] text-stone-400 font-mono truncate">{student.matricula}</p>
                          </div>
                        </div>

                        {hasOverdue && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Atraso</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Right Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#141311] overflow-hidden">
            {/* Conversation Partner Banner */}
            <div className="p-3.5 sm:px-5 border-b border-stone-800 bg-[#181715] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                  {isAdmin ? <GraduationCap className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{isAdmin ? currentPartner?.name : 'Coordenação da Biblioteca Escolar'}</span>
                    {isAdmin && currentPartner?.turma && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                        {currentPartner.turma}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {isAdmin
                      ? `Matrícula: ${currentPartner?.matricula} · ${studentOverdueLoans.length > 0 ? `⚠️ ${studentOverdueLoans.length} empréstimo(s) atrasado(s)` : 'Sem pendências críticas'}`
                      : 'Atendimento oficial para renovações, devoluções e dúvidas.'}
                  </p>
                </div>
              </div>

              {/* Overdue Book Indicator Badge */}
              {currentBookDiscussed && (
                <div className="hidden sm:flex items-center gap-2 p-1.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[200px] font-medium">
                    {currentBookDiscussed.title} (Venceu {currentLoanDiscussed?.dueDate})
                  </span>
                </div>
              )}
            </div>

            {/* Overdue Alert Context Bar (If student has overdue book) */}
            {studentOverdueLoans.length > 0 && (
              <div className="p-2.5 px-4 bg-rose-950/40 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  <span>
                    <strong>Cobrança Pendente:</strong> {currentPartner?.name} possui{' '}
                    <strong className="text-white">{studentOverdueLoans.length} obra(s) em atraso</strong>.
                  </span>
                </div>
                {isAdmin && (
                  <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">
                    Envie cobrança pelos atalhos abaixo
                  </span>
                )}
              </div>
            )}

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#181715] border border-stone-800 text-stone-400">
                    <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Nenhuma mensagem trocada ainda</h4>
                    <p className="text-xs text-stone-400 max-w-sm mt-1">
                      {isAdmin
                        ? 'Envie um aviso ou cobrança amigável para o aluno regularizar a devolução dos livros.'
                        : 'Você não possui mensagens da coordenação. Se precisar tirar dúvidas sobre seus empréstimos, envie uma mensagem abaixo.'}
                    </p>
                  </div>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMe = isAdmin
                    ? msg.senderRole === 'coordinator' || msg.senderRole === 'admin'
                    : msg.senderId === currentUser.id;

                  const formattedTime = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                        <span className="font-semibold text-stone-300">{msg.senderName}</span>
                        <span>·</span>
                        <span>{formattedTime}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm space-y-1.5 ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-[#181715] text-stone-200 border border-stone-800 rounded-tl-none'
                        } ${msg.isUrgentNotice ? 'ring-2 ring-rose-500/40' : ''}`}
                      >
                        {msg.isUrgentNotice && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider pb-1 border-b border-white/20">
                            <BellRing className="w-3 h-3" />
                            <span>Aviso da Biblioteca</span>
                          </div>
                        )}

                        {msg.bookTitle && (
                          <div className={`p-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                            isMe ? 'bg-emerald-700/80 text-emerald-100' : 'bg-[#11100E] text-stone-300 border border-stone-700/60'
                          }`}>
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Livro: {msg.bookTitle}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Bar (For Coordinator: 1-click collection notices) */}
            {isAdmin && (
              <div className="p-2 sm:px-4 bg-[#11100E] border-t border-stone-800 space-y-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Modelos Prontos de Cobrança (1 Clique):</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickNoticeTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(tpl.text, tpl.urgent)}
                      className="px-2.5 py-1 rounded-lg bg-[#181715] hover:bg-emerald-950/60 hover:border-emerald-500/40 border border-stone-700/80 text-[11px] text-stone-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Replies for Student */}
            {!isAdmin && (
              <div className="p-2 sm:px-4 bg-[#11100E] border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <span className="text-[10px] text-stone-500 font-semibold shrink-0">Respostas rápidas:</span>
                {studentQuickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(reply)}
                    className="px-2.5 py-1 rounded-lg bg-[#181715] hover:bg-stone-800 text-[11px] text-stone-300 hover:text-white border border-stone-700/80 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Text Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 sm:p-4 bg-[#181715] border-t border-stone-800 flex items-center gap-2.5 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isAdmin
                    ? `Escrever mensagem para ${currentPartner?.name.split(' ')[0]}...`
                    : 'Escrever mensagem para a coordenação...'
                }
                className="flex-1 px-4 py-2.5 bg-[#11100E] border border-stone-700 rounded-xl text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 sm:px-4 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
