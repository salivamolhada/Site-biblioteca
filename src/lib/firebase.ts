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
import { Book, Loan, User } from '../types';

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
