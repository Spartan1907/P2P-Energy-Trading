/**
 * Authentication & Identity Service for Smart Grid 2.0 P2P Energy Market
 * Supports role-based access control (Admin Market Operator vs Prosumer/Consumer User),
 * credential verification, session management, and new participant cryptographic onboarding.
 */

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string; // Plain/SHA-salted for demo simulation
  role: 'ADMIN' | 'USER';
  userType: 'OPERATOR' | 'PROSUMER' | 'CONSUMER';
  name: string;
  participantId?: string;
  gridNodeId?: string;
  did: string;
  nmi: string; // National Meter Identifier
  pvCapacityKw?: number;
  batteryCapacityKwh?: number;
  reputationScore: number;
}

export interface AuthSession {
  role: 'ADMIN' | 'USER' | 'SIMULATOR';
  username: string;
  name: string;
  email?: string;
  participantId?: string;
  gridNodeId?: string;
  did?: string;
  token?: string;
  loginTimestamp?: number;
}

const STORAGE_KEY = 'sg2_p2p_auth_session';
const ACCOUNTS_STORAGE_KEY = 'sg2_p2p_registered_accounts';

// Pre-seeded verified accounts for demo & evaluation
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc_admin_01',
    email: 'admin@sg2.grid',
    passwordHash: 'admin123',
    role: 'ADMIN',
    userType: 'OPERATOR',
    name: 'Smart Grid 2.0 Market Operator (Admin)',
    did: 'did:sg2:grid-operator-01',
    nmi: 'NMI-9999-OPERATOR',
    reputationScore: 0.99,
  },
  {
    id: 'acc_user_solar_03',
    email: 'solar3@sg2.grid',
    passwordHash: 'solar123',
    role: 'USER',
    userType: 'PROSUMER',
    name: 'Alice Solar Prosumer (Node 3)',
    participantId: 'node_user_3',
    gridNodeId: 'Bus-3',
    did: 'did:sg2:meter-au-vic-3042',
    nmi: 'NMI-7841-SOLAR3',
    pvCapacityKw: 7.5,
    batteryCapacityKwh: 13.5,
    reputationScore: 0.94,
  },
  {
    id: 'acc_user_battery_07',
    email: 'battery7@sg2.grid',
    passwordHash: 'battery123',
    role: 'USER',
    userType: 'PROSUMER',
    name: 'Commercial Battery Storage ESS (Node 7)',
    participantId: 'node_user_7',
    gridNodeId: 'Bus-7',
    did: 'did:sg2:meter-au-vic-7089',
    nmi: 'NMI-4412-BATT7',
    pvCapacityKw: 15.0,
    batteryCapacityKwh: 25.0,
    reputationScore: 0.91,
  },
  {
    id: 'acc_user_consumer_12',
    email: 'consumer12@sg2.grid',
    passwordHash: 'consumer123',
    role: 'USER',
    userType: 'CONSUMER',
    name: 'Residential Tenant / EV Charger (Node 12)',
    participantId: 'node_user_12',
    gridNodeId: 'Bus-12',
    did: 'did:sg2:meter-au-vic-9921',
    nmi: 'NMI-9912-CONS12',
    pvCapacityKw: 0.0,
    batteryCapacityKwh: 0.0,
    reputationScore: 0.88,
  },
];

export class AuthService {
  private static accounts: UserAccount[] = [...DEFAULT_ACCOUNTS];

  static init(): void {
    try {
      const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.accounts = parsed;
        }
      }
    } catch {
      // Fallback to default
    }
  }

  static getAccounts(): UserAccount[] {
    return this.accounts;
  }

  /**
   * Authenticate user with email and password
   */
  static authenticate(
    email: string,
    password: string,
    expectedRole?: 'ADMIN' | 'USER'
  ): { success: boolean; session?: AuthSession; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const account = this.accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (!account) {
      return {
        success: false,
        error: `No account found for "${email}". Check credentials or register a new participant.`,
      };
    }

    if (account.passwordHash !== password) {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials or use the 1-click Demo Fill.',
      };
    }

    if (expectedRole && account.role !== expectedRole) {
      return {
        success: false,
        error: `Role mismatch: This account is registered as ${account.role}, not ${expectedRole}.`,
      };
    }

    const session: AuthSession = {
      role: account.role,
      username: account.email.split('@')[0],
      name: account.name,
      email: account.email,
      participantId: account.participantId || (account.role === 'ADMIN' ? 'admin_operator' : 'node_user_3'),
      gridNodeId: account.gridNodeId || 'Bus-1',
      did: account.did,
      token: `sg2_tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`,
      loginTimestamp: Date.now(),
    };

    this.storeSession(session);
    return { success: true, session };
  }

  /**
   * Register a new Prosumer or Consumer participant
   */
  static registerParticipant(params: {
    name: string;
    email: string;
    password: string;
    role: 'PROSUMER' | 'CONSUMER';
    gridNodeId: string;
    pvCapacityKw: number;
    batteryCapacityKwh: number;
  }): { success: boolean; session?: AuthSession; error?: string; account?: UserAccount } {
    const trimmedEmail = params.email.trim().toLowerCase();
    if (!trimmedEmail || !params.password || !params.name) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    const existing = this.accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const nextIndex = this.accounts.length + 1;
    const participantId = `node_user_${100 + nextIndex}`;
    const hashSeed = Math.random().toString(36).substring(2, 8);
    const did = `did:sg2:meter-nmi-${params.gridNodeId.toLowerCase()}-${hashSeed}`;
    const nmi = `NMI-${Math.floor(1000 + Math.random() * 9000)}-${hashSeed.toUpperCase()}`;

    const newAccount: UserAccount = {
      id: `acc_user_${Date.now()}`,
      email: trimmedEmail,
      passwordHash: params.password,
      role: 'USER',
      userType: params.role,
      name: params.name,
      participantId,
      gridNodeId: params.gridNodeId,
      did,
      nmi,
      pvCapacityKw: params.pvCapacityKw,
      batteryCapacityKwh: params.batteryCapacityKwh,
      reputationScore: 0.85, // Initial Bayesian prior 0.85
    };

    this.accounts.push(newAccount);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
    } catch {
      // Ignored
    }

    const session: AuthSession = {
      role: 'USER',
      username: newAccount.email.split('@')[0],
      name: newAccount.name,
      email: newAccount.email,
      participantId: newAccount.participantId,
      gridNodeId: newAccount.gridNodeId,
      did: newAccount.did,
      token: `sg2_tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`,
      loginTimestamp: Date.now(),
    };

    this.storeSession(session);
    return { success: true, session, account: newAccount };
  }

  /**
   * Save session to localStorage
   */
  static storeSession(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignored
    }
  }

  /**
   * Get active session from localStorage
   */
  static getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignored
    }
    return null;
  }

  /**
   * Clear session on logout
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
}

// Auto initialize on load
AuthService.init();
