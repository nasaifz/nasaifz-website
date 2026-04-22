import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AuditLog } from '../types';

export const logActivity = async (
  userId: string,
  username: string,
  action: string,
  resource: string,
  details: string
) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      username,
      action,
      resource,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
