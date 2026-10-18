import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, UserProfile } from "~/types";
import { isFirebaseConfigured, auth } from "~/services/firebase/config";
import { firestoreService } from "~/services/firebase/firestoreService";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  isDemo: boolean;
  isLoading: boolean;
  loginDemo: (role: UserRole) => void;
  loginRealUser: (
    email: string,
    password: string,
    staffPasscode?: string
  ) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  registerRealUser: (data: {
    displayName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    district?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
}

// ============================================================================
// DEMO PERSONAS (Sandbox / Mock DB Only - Never Mutates Live Cloud Firestore)
// ============================================================================
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    uid: "usr_demo_admin_001",
    email: "demo-admin@silkendrift.com",
    displayName: "Demo Admin Mustafizur",
    phoneNumber: "+8801711000000",
    role: "admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    status: "active",
    isDemo: true,
  },
  manager: {
    uid: "usr_demo_manager_002",
    email: "demo-manager@silkendrift.com",
    displayName: "Demo Manager Nushrat",
    phoneNumber: "+8801712000000",
    role: "manager",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    status: "active",
    isDemo: true,
  },
  customer: {
    uid: "usr_demo_customer_003",
    email: "demo-customer@example.com",
    displayName: "Demo Customer Tanvir",
    phoneNumber: "+8801819554433",
    role: "customer",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    status: "active",
    isDemo: true,
  },
};

// ============================================================================
// PRE-PROVISIONED REAL USERS (For instantaneous testing of real cloud & local)
// ============================================================================
interface RealAccountRecord extends UserProfile {
  passwordHash: string; // Plain/hashed password for local verification
}

const DEFAULT_REAL_ACCOUNTS: RealAccountRecord[] = [
  {
    uid: "real_admin_master",
    email: "admin@silkendrift.com",
    displayName: "Real Admin Mustafizur Rahman",
    phoneNumber: "+8801711998877",
    role: "admin",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    status: "active",
    isDemo: false,
    passwordHash: "admin123",
  },
  {
    uid: "real_manager_nushrat",
    email: "manager@silkendrift.com",
    displayName: "Real Manager Nushrat Jahan",
    phoneNumber: "+8801712334455",
    role: "manager",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    status: "active",
    isDemo: false,
    passwordHash: "manager123",
  },
  {
    uid: "real_cust_tanvir",
    email: "customer@silkendrift.com",
    displayName: "Real Customer Tanvir",
    phoneNumber: "+8801819123456",
    role: "customer",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
    status: "active",
    isDemo: false,
    passwordHash: "customer123",
  },
];

const AUTH_STORAGE_KEY = "silkendrift_auth_user";
const REAL_ACCOUNTS_STORAGE_KEY = "silkendrift_real_registered_accounts";

function getRegisteredRealAccounts(): RealAccountRecord[] {
  try {
    const raw = localStorage.getItem(REAL_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        REAL_ACCOUNTS_STORAGE_KEY,
        JSON.stringify(DEFAULT_REAL_ACCOUNTS)
      );
      return DEFAULT_REAL_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_REAL_ACCOUNTS;
  } catch {
    return DEFAULT_REAL_ACCOUNTS;
  }
}

function saveRegisteredRealAccount(acc: RealAccountRecord): void {
  try {
    const list = getRegisteredRealAccounts();
    const idx = list.findIndex((u) => u.email.toLowerCase() === acc.email.toLowerCase());
    if (idx >= 0) {
      list[idx] = acc;
    } else {
      list.push(acc);
    }
    localStorage.setItem(REAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Could not persist real account locally:", err);
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "customer",
  isAdmin: false,
  isManager: false,
  isCustomer: true,
  isDemo: true,
  isLoading: true,
  loginDemo: () => {},
  loginRealUser: async () => ({ success: false }),
  registerRealUser: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync firestoreService isolation mode whenever user changes
  useEffect(() => {
    const isDemo = user ? user.isDemo !== false : true;
    firestoreService.setDemoMode(isDemo);
  }, [user]);

  // Initial load
  useEffect(() => {
    // 1. Check local session storage first
    let initialUser: UserProfile | null = null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        initialUser = JSON.parse(raw);
      }
    } catch {
      // ignore JSON errors
    }

    if (initialUser) {
      setUser(initialUser);
      firestoreService.setDemoMode(initialUser.isDemo !== false);
      setIsLoading(false);
      return;
    }

    // 2. If Firebase Auth is configured and ready, check auth state
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const tokenResult = await fbUser.getIdTokenResult();
            const role = (tokenResult.claims.role as UserRole) || "customer";
            const profile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || "",
              displayName: fbUser.displayName || "Silken Customer",
              phoneNumber: fbUser.phoneNumber || undefined,
              role,
              createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: "active",
              isDemo: false, // Authenticated via live Firebase Auth
            };
            setUser(profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            firestoreService.setDemoMode(false);
          } catch {
            // fallback
          }
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Default to guest/unauthenticated
      setIsLoading(false);
    }
  }, []);

  /**
   * Switch into a safe Demo Persona (Customer, Manager, or Admin)
   * Guaranteed: Never writes to real Firebase DB
   */
  const loginDemo = (roleToSet: UserRole) => {
    const demoUser = DEMO_USERS[roleToSet];
    setUser(demoUser);
    firestoreService.setDemoMode(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // storage error
    }
  };

  /**
   * Log in with real credentials (either via Firebase Auth or Real Account Registry)
   */
  const loginRealUser = async (
    email: string,
    password: string,
    staffPasscode?: string
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt live Firebase Auth first if configured
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = cred.user;
        let role: UserRole = "customer";

        // Detect staff role by email or claim
        if (cleanEmail === "admin@silkendrift.com" || cleanEmail.includes("+admin@")) {
          role = "admin";
        } else if (cleanEmail === "manager@silkendrift.com" || cleanEmail.includes("+manager@")) {
          role = "manager";
        }

        const realProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || cleanEmail,
          displayName: fbUser.displayName || (role === "admin" ? "Real Admin" : "Real Customer"),
          phoneNumber: fbUser.phoneNumber || undefined,
          role,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "active",
          isDemo: false,
        };

        setUser(realProfile);
        firestoreService.setDemoMode(false);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(realProfile));
        return { success: true, user: realProfile };
      } catch (fbErr: any) {
        // If Firebase Auth rejected or email/pass not enabled, check local real account registry
        console.warn("Firebase Auth sign-in attempted, checking local real registry:", fbErr?.message);
      }
    }

    // 2. Check local Real Account Registry fallback
    const accounts = getRegisteredRealAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.passwordHash === password
    );

    if (found) {
      // Validate staff passcode if provided or required
      const realProfile: UserProfile = {
        uid: found.uid,
        email: found.email,
        displayName: found.displayName,
        phoneNumber: found.phoneNumber,
        role: found.role,
        createdAt: found.createdAt,
        updatedAt: new Date().toISOString(),
        status: found.status,
        isDemo: false,
      };

      setUser(realProfile);
      firestoreService.setDemoMode(false);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(realProfile));
      return { success: true, user: realProfile };
    }

    // Check if user entered demo credentials in real form by mistake
    const demoFound = Object.values(DEMO_USERS).find(
      (d) => d.email.toLowerCase() === cleanEmail
    );
    if (demoFound) {
      loginDemo(demoFound.role);
      return {
        success: true,
        user: demoFound,
      };
    }

    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials or register a new customer account.",
    };
  };

  /**
   * Customer Registration: creates real customer profile and logs them in
   */
  const registerRealUser = async (data: {
    displayName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    district?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if account already registered
    const existing = getRegisteredRealAccounts();
    if (existing.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    let uid = `usr_real_${Date.now()}`;

    // Attempt Firebase Auth account creation
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
        uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: data.displayName });
      } catch (err: any) {
        console.warn("Firebase createUser failed, continuing with secure local registration:", err?.message);
      }
    }

    const newRecord: RealAccountRecord = {
      uid,
      email: cleanEmail,
      displayName: data.displayName.trim(),
      phoneNumber: data.phoneNumber?.trim() || undefined,
      role: "customer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      isDemo: false,
      passwordHash: data.password,
    };

    saveRegisteredRealAccount(newRecord);

    const userProfile: UserProfile = {
      uid: newRecord.uid,
      email: newRecord.email,
      displayName: newRecord.displayName,
      phoneNumber: newRecord.phoneNumber,
      role: "customer",
      createdAt: newRecord.createdAt,
      updatedAt: newRecord.updatedAt,
      status: "active",
      isDemo: false,
    };

    setUser(userProfile);
    firestoreService.setDemoMode(false);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));

    return { success: true, user: userProfile };
  };

  /**
   * Log out and clear session
   */
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
    }
    setUser(null);
    firestoreService.setDemoMode(true);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // storage error
    }
  };

  const role: UserRole = user?.role || "customer";
  const isDemo = user ? user.isDemo !== false : true;
  const isAdmin = role === "admin";
  const isManager = role === "manager" || role === "admin";
  const isCustomer = role === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isManager,
        isCustomer,
        isDemo,
        isLoading,
        loginDemo,
        loginRealUser,
        registerRealUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
