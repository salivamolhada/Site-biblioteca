import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book, Loan, User, LoginActivity, ChatMessage } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: The app requires firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operation types for error diagnosis
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting.');
    }
    return false;
  }
}

// Subscribe to books collection
export function subscribeToBooks(
  onBooksChanged: (books: Book[]) => void
): Unsubscribe {
  const colRef = collection(db, 'books');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Book[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Book);
        });
        onBooksChanged(items);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'books');
    }
  );
}

// Subscribe to loans collection
export function subscribeToLoans(
  onLoansChanged: (loans: Loan[]) => void
): Unsubscribe {
  const colRef = collection(db, 'loans');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Loan[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Loan);
        });
        onLoansChanged(items);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'loans');
    }
  );
}

// Subscribe to users collection
export function subscribeToUsers(
  onUsersChanged: (users: User[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: User[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as User);
        });
        onUsersChanged(items);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  );
}

// Save or update book in Firestore
export async function saveBookToFirestore(book: Book): Promise<void> {
  const path = `books/${book.id}`;
  try {
    await setDoc(doc(db, 'books', book.id), book, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete book from Firestore
export async function deleteBookFromFirestore(bookId: string): Promise<void> {
  const path = `books/${bookId}`;
  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Save or update loan in Firestore
export async function saveLoanToFirestore(loan: Loan): Promise<void> {
  const path = `loans/${loan.id}`;
  try {
    await setDoc(doc(db, 'loans', loan.id), loan, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save or update user in Firestore
export async function saveUserToFirestore(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Seed initial data if Firestore collections are empty
export async function seedInitialFirestoreData(
  seedBooksList: Book[],
  seedUsersList: User[],
  seedLoansList: Loan[]
): Promise<void> {
  try {
    const booksSnap = await getDocs(collection(db, 'books'));
    if (booksSnap.empty) {
      for (const b of seedBooksList) {
        await setDoc(doc(db, 'books', b.id), b);
      }
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      for (const u of seedUsersList) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    }

    const loansSnap = await getDocs(collection(db, 'loans'));
    if (loansSnap.empty) {
      for (const l of seedLoansList) {
        await setDoc(doc(db, 'loans', l.id), l);
      }
    }
  } catch (err) {
    console.warn('Initial seeding bypassed or already initialized:', err);
  }
}

// Get users directly
export async function getUsersFromFirestore(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const items: User[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as User));
    return items;
  } catch (err) {
    console.warn('Failed to fetch users from Firestore:', err);
    return [];
  }
}

// Get books directly
export async function getBooksFromFirestore(): Promise<Book[]> {
  try {
    const snap = await getDocs(collection(db, 'books'));
    const items: Book[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as Book));
    return items;
  } catch (err) {
    console.warn('Failed to fetch books from Firestore:', err);
    return [];
  }
}

// Get loans directly
export async function getLoansFromFirestore(): Promise<Loan[]> {
  try {
    const snap = await getDocs(collection(db, 'loans'));
    const items: Loan[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as Loan));
    return items;
  } catch (err) {
    console.warn('Failed to fetch loans from Firestore:', err);
    return [];
  }
}

// Helpers for Session and Device
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sessId = sessionStorage.getItem('polo_session_id_v2');
  if (!sessId) {
    sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('polo_session_id_v2', sessId);
  }
  return sessId;
}

export function getDeviceDescription(): string {
  if (typeof navigator === 'undefined') return 'Navegador Web';
  const ua = navigator.userAgent;
  let browser = 'Navegador';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Dispositivo';
  if (/Android/i.test(ua)) os = 'Android Mobile';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iPhone/iPad';
  else if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Mac/i.test(ua)) os = 'Mac';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${browser} em ${os}`;
}

// Record login event in Firestore
export async function recordUserLogin(
  user: User,
  sessionId?: string,
  device?: string
): Promise<LoginActivity | null> {
  const currentSessionId = sessionId || getOrCreateSessionId();
  const currentDevice = device || getDeviceDescription();
  const loginRecord: LoginActivity = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    device: currentDevice,
    sessionId: currentSessionId,
    timestamp: new Date().toISOString(),
    status: 'sucesso',
    location: 'Colégio Unidade Polo (Rede Interna/Externa)',
  };

  const path = `login_activities/${loginRecord.id}`;
  try {
    await setDoc(doc(db, 'login_activities', loginRecord.id), loginRecord);
    return loginRecord;
  } catch (err) {
    console.warn('Could not record login activity to Firestore:', err);
    return null;
  }
}

// Subscribe to all login activities (for Admin and Live Security Monitoring)
export function subscribeToAllLogins(
  onLoginsChanged: (logins: LoginActivity[]) => void
): Unsubscribe {
  const colRef = collection(db, 'login_activities');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: LoginActivity[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as LoginActivity);
      });
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onLoginsChanged(items);
    },
    (err) => {
      console.warn('Login activities subscription warning:', err);
    }
  );
}

// Get all chat messages directly
export async function getMessagesFromFirestore(): Promise<ChatMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'messages'));
    const items: ChatMessage[] = [];
    snap.forEach((docSnap) => items.push(docSnap.data() as ChatMessage));
    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return items;
  } catch (err) {
    console.warn('Failed to fetch messages from Firestore:', err);
    return [];
  }
}

// Save a new chat message in Firestore
export async function saveChatMessage(message: ChatMessage): Promise<void> {
  const path = `messages/${message.id}`;
  try {
    await setDoc(doc(db, 'messages', message.id), message, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Mark a chat message as read in Firestore
export async function markChatMessageAsRead(messageId: string): Promise<void> {
  const path = `messages/${messageId}`;
  try {
    await setDoc(doc(db, 'messages', messageId), { read: true }, { merge: true });
  } catch (err) {
    console.warn('Could not mark message as read in Firestore:', err);
  }
}

// Subscribe to all chat messages (Real-time updates for both Admin & Student)
export function subscribeToMessages(
  onMessagesChanged: (messages: ChatMessage[]) => void
): Unsubscribe {
  const colRef = collection(db, 'messages');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ChatMessage);
      });
      // Sort chronologically (oldest to newest)
      items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onMessagesChanged(items);
    },
    (err) => {
      console.warn('Messages subscription warning:', err);
    }
  );
}
