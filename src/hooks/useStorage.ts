import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType, onAuthStateChanged } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export function useStorage<T>(collectionName: string, options: { enabled?: boolean } = { enabled: true }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!options.enabled) {
      setData([]);
      setLoading(false);
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up existing firestore listener if auth state changes
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      // For some collections like appointments, we might allow public reads
      if (!user && collectionName !== 'appointments') {
        setData([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, collectionName));
      
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ ...doc.data() } as T);
        });
        setData(items);
        setLoading(false);
      }, (error) => {
        // If it's a permission error, don't crash, just log and clear
        if (error.code === 'permission-denied') {
          console.warn(`Permission denied for list: ${collectionName}`);
          setData([]);
          setLoading(false);
          return;
        }
        handleFirestoreError(error, OperationType.LIST, collectionName);
      });
    });

    return () => {
      unsubAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [collectionName, options.enabled]);

  const addItem = async (item: any) => {
    try {
      const id = item.id || doc(collection(db, collectionName)).id;
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, { ...item, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, collectionName);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  };

  const clearAll = async () => {
    try {
      const q = query(collection(db, collectionName));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach(async (d) => {
          await deleteDoc(doc(db, collectionName, d.id));
        });
      });
      // Unsubscribe immediately after starting deletions as onSnapshot will keep firing
      setTimeout(unsubscribe, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  };

  const reload = () => {
    // onSnapshot handles real-time updates automatically
  };

  return { data, setData, addItem, updateItem, removeItem, reload, clearAll, loading };
}
