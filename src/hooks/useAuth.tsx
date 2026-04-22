import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole, AppModule, AppAction, Permission } from '../types';
import { logActivity } from '../services/auditService';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<UserProfile>) => Promise<void>;
  adminCreateUser: (email: string, password: string, userData: Partial<UserProfile>) => Promise<string>;
  initializeQuilla: () => Promise<void>;
  hasPermission: (module: AppModule, action: AppAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DOMAIN_SUFFIX = '@quilla.id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        const bootstrapEmails = [
          'nasa@quilla.id',
          'nasai.furqan.zakaria@gmail.com',
          'nasaifurqanzakaria@gmail.com'
        ];

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          // Force super_admin role for bootstrap emails
          if (bootstrapEmails.includes(firebaseUser.email || '')) {
            profileData.role = 'super_admin';
          }
          setProfile(profileData);
        } else if (bootstrapEmails.includes(firebaseUser.email || '')) {
          // Synthetic profile for bootstrap admins without doc
          const syntheticProfile: UserProfile = {
            uid: firebaseUser.uid,
            username: firebaseUser.email?.split('@')[0] || 'admin',
            fullName: 'Bootstrap Administrator',
            email: firebaseUser.email || '',
            role: 'super_admin',
            hierarchy: { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'Security' },
            status: 'active',
            createdAt: null,
            lastLogin: new Date(),
            mfaEnabled: true
          };
          setProfile(syntheticProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasPermission = (module: AppModule, action: AppAction): boolean => {
    if (!profile) return false;
    if (profile.role === 'super_admin') return true;
    
    // Check specific permission overrides first
    if (profile.permissions) {
      const modPerm = profile.permissions.find(p => p.module === module);
      if (modPerm && modPerm.actions.includes(action)) return true;
    }

    // Role-based defaults (simplified for now, can be expanded to a mapping)
    const roleDefaults: Record<UserRole, Partial<Record<AppModule, AppAction[]>>> = {
      super_admin: {}, // Handled above
      group_ceo: { dashboard: ['read'], users: ['read'], finance: ['read'], agriculture: ['read'], livestock: ['read'] },
      investor: { dashboard: ['read'], finance: ['read'] },
      coo_cto: { dashboard: ['read'], inventory: ['read', 'write'], livestock: ['read', 'write'], agriculture: ['read', 'write'] },
      hrd: { employees: ['read', 'write', 'edit'], dashboard: ['read'] },
      niaga: { inventory: ['read', 'write'], customers: ['read', 'write'], products: ['read', 'write'] },
      peternakan: { livestock: ['read', 'write'], inventory: ['read'] },
      pertanian: { agriculture: ['read', 'write'], inventory: ['read'] },
      viewer: { dashboard: ['read'], products: ['read'] }
    };

    const defaults = roleDefaults[profile.role]?.[module];
    return defaults?.includes(action) ?? false;
  };

  const login = async (username: string, password: string) => {
    const email = username.includes('@') ? username : `${username}${DOMAIN_SUFFIX}`;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', userCredential.user.uid);
      const profileDoc = await getDoc(userRef);
      
      if (!profileDoc.exists()) {
        if (username === 'nasa') {
           const repairProfile: UserProfile = {
            uid: userCredential.user.uid,
            username: 'nasa',
            fullName: 'Quilla Root Administrator',
            email,
            role: 'super_admin',
            hierarchy: { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'Security' },
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            mfaEnabled: false,
            status: 'active'
          };
          await setDoc(userRef, repairProfile);
          setProfile(repairProfile);
          return;
        }
        throw new Error('Profil pengguna tidak ditemukan di database.');
      }

      const profileData = profileDoc.data() as UserProfile;
      
      // Update last login
      await updateDoc(userRef, { lastLogin: serverTimestamp() });
      
      setProfile({ ...profileData, lastLogin: new Date() });
      await logActivity(userCredential.user.uid, profileData.username, 'Login Success', 'Auth', 'Authenticated successfully via encrypted gateway');
    } catch (error: any) {
      try {
        await logActivity('system', username, 'Login Failure', 'Auth', `Failed attempt for user identifier: ${username}`);
      } catch (logErr) {
        console.error("Meta-logging failure:", logErr);
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Metode login belum aktif. Hubungi administrator.');
      }
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Identitas atau kunci akses tidak valid.');
      }
      throw error;
    }
  };

  const logout = async () => {
    if (user && profile) {
      await logActivity(user.uid, profile.username, 'LOGOUT', 'AUTH', 'Terminal disconnected');
    }
    await signOut(auth);
  };

  const register = async (userData: Partial<UserProfile>) => {
    if (!profile || profile.role !== 'super_admin') {
      throw new Error('Otoritas tidak cukup untuk mendaftarkan identitas baru.');
    }
    // Simple mock since client SDK can't create other users easily
    console.log('Registering new identity:', userData);
  };

  const adminCreateUser = async (email: string, password: string, userData: Partial<UserProfile>) => {
    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'group_ceo')) {
      throw new Error('Unauthorized: Only Super Admins and CEOs can create new accounts.');
    }

    const apiKey = firebaseConfig.apiKey;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

    // 1. Create Auth User via REST API
    const authResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: false
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      const errorCode = authData.error?.message;
      if (errorCode === 'EMAIL_EXISTS') {
        throw new Error('Alamat email ini sudah terdaftar. Silakan gunakan email lain atau edit akun yang sudah ada.');
      }
      if (errorCode === 'WEAK_PASSWORD') {
        throw new Error('Kata sandi terlalu lemah. Gunakan setidaknya 6 karakter.');
      }
      throw new Error(errorCode || 'Gagal membuat kredensial otentikasi.');
    }

    const uid = authData.localId;

    // 2. Create User Profile in Firestore
    const newProfile: UserProfile = {
      uid,
      username: userData.username || email.split('@')[0],
      fullName: userData.fullName || 'New User',
      email,
      role: userData.role || 'viewer',
      hierarchy: userData.hierarchy || { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'General' },
      createdAt: serverTimestamp(),
      lastLogin: null,
      mfaEnabled: false,
      status: 'active',
      createdBy: profile.uid
    };

    await setDoc(doc(db, 'users', uid), newProfile);
    
    await logActivity(
      profile.uid, 
      profile.username, 
      'CREATE_USER', 
      'Auth', 
      `Established new system identity: @${newProfile.username} (${email})`
    );

    return uid;
  };

  const initializeQuilla = async () => {
    const username = 'nasa';
    const email = `nasa${DOMAIN_SUFFIX}`;
    const password = 'adminnyanasaya';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        username,
        fullName: 'Quilla Root Administrator',
        email,
        role: 'super_admin',
        hierarchy: { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'Security' },
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        mfaEnabled: false,
        status: 'active',
        createdBy: 'SYSTEM_BOOTSTRAP'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      setProfile(newProfile);
      await logActivity(userCredential.user.uid, username, 'INITIALIZE_ADMIN', 'SYSTEM', 'Root authorization node established');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        await login(username, password);
      } else {
        console.error('Core init failed:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, register, adminCreateUser, initializeQuilla, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
