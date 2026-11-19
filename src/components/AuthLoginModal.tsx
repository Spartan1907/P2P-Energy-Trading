import React, { useState } from 'react';
import {
  ShieldAlert,
  User,
  KeyRound,
  Zap,
  Sun,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Participant } from '../core/types';
import { AuthService } from '../core/authService';

export interface AuthSession {
  role: 'ADMIN' | 'USER' | 'SIMULATOR';
  username: string;
  name: string;
  participantId?: string;
  gridNodeId?: string;
  email?: string;
}

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: AuthSession) => void;
  participants: Participant[];
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  participants,
}) => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'USER'>('ADMIN');
  const [email, setEmail] = useState('admin@sg2.grid');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedUserPartId, setSelectedUserPartId] = useState<string>(
    participants[2]?.id || participants[0]?.id || 'node_user_3'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = AuthService.authenticate(email, password, selectedRole);
    if (!res.success || !res.session) {
      setErrorMsg(res.error || 'Invalid credentials');
      return;
    }

    onLogin(res.session);
    onClose();
  };

  const handleQuickLoginAdmin = () => {
    const res = AuthService.authenticate('admin@sg2.grid', 'admin123', 'ADMIN');
    if (res.session) {
      onLogin(res.session);
    } else {
      onLogin({
        role: 'ADMIN',
        username: 'admin_operator',
        name: 'Smart Grid 2.0 Market Operator (Admin)',
        email: 'admin@sg2.grid',
      });
    }
    onClose();
  };

  const handleQuickLoginUser = (partId: string) => {
    const part = participants.find((p) => p.id === partId) || participants[0];
    const session: AuthSession = {
      role: 'USER',
      username: part.id,
      name: part.name,
      participantId: part.id,
      gridNodeId: part.gridNodeId,
      email: `${part.id}@sg2.grid`,
    };
    AuthService.storeSession(session);
    onLogin(session);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="card-title" style={{ fontSize: '1.2rem' }}>
              <Lock size={20} color="var(--cyan-400)" /> Microgrid Platform Login
            </span>
            <span className="card-subtitle">
              Sign in as <strong>Market Admin</strong> or as a registered <strong>P2P User</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('ADMIN');
              setEmail('operator@sg2.microgrid');
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              border: selectedRole === 'ADMIN' ? '2px solid var(--purple-400)' : '1px solid var(--border)',
              background: selectedRole === 'ADMIN' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: selectedRole === 'ADMIN' ? 'var(--purple-400)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <ShieldAlert size={18} /> Market Admin
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('USER');
              setEmail('prosumer@node3.microgrid');
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              border: selectedRole === 'USER' ? '2px solid var(--cyan-400)' : '1px solid var(--border)',
              background: selectedRole === 'USER' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: selectedRole === 'USER' ? 'var(--cyan-400)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <User size={18} /> P2P User Portal
          </button>
        </div>

        {/* Quick Demo Login Presets */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            ⚡ 1-Click Fast Demo Login:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
              onClick={handleQuickLoginAdmin}
            >
              <Zap size={13} color="var(--purple-400)" /> Login as Market Operator (Admin)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickLoginUser('node_user_3')}
            >
              <Sun size={13} color="var(--amber-400)" /> Login as Solar Prosumer #3
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickLoginUser('node_user_12')}
            >
              <User size={13} color="var(--cyan-400)" /> Login as Vulnerable Consumer #12
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--red-500)',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                color: 'var(--red-400)',
                fontSize: '0.8rem',
              }}
            >
              {errorMsg}
            </div>
          )}
          {selectedRole === 'USER' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                SELECT PARTICIPANT NODE:
              </label>
              <select
                value={selectedUserPartId}
                onChange={(e) => setSelectedUserPartId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) &bull; Tier {p.wealthTier} &bull; Score: {p.reputation.score.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              EMAIL / CREDENTIAL IDENTIFIER:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              PASSWORD / PRIVATE KEY PIN:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              fontSize: '0.92rem',
              marginTop: '0.5rem',
              background: selectedRole === 'ADMIN'
                ? 'linear-gradient(135deg, var(--purple-500), #6d28d9)'
                : 'linear-gradient(135deg, var(--cyan-500), #0284c7)',
            }}
          >
            <KeyRound size={16} /> Enter {selectedRole === 'ADMIN' ? 'Admin Market Console' : 'User Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
