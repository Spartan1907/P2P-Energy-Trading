import React, { useState } from 'react';
import {
  Lock,
  Shield,
  User,
  KeyRound,
  Zap,
  Sun,
  Battery,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Cpu,
  Layers,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthService, AuthSession } from '../core/authService';
import { Participant } from '../core/types';

interface LoginPageViewProps {
  currentSession: AuthSession;
  onLoginSuccess: (session: AuthSession) => void;
  onRegisterParticipant?: (participant: Participant) => void;
  onNavigateTab: (tab: 'MARKET' | 'ADMIN_MARKET' | 'USER_PORTAL') => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  currentSession,
  onLoginSuccess,
  onRegisterParticipant,
  onNavigateTab,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [roleTab, setRoleTab] = useState<'ADMIN' | 'USER'>('ADMIN');

  // Login form state
  const [email, setEmail] = useState('admin@sg2.grid');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('Bob Solar Residence');
  const [regEmail, setRegEmail] = useState('bob.solar@sg2.grid');
  const [regPassword, setRegPassword] = useState('pass123');
  const [regRole, setRegRole] = useState<'PROSUMER' | 'CONSUMER'>('PROSUMER');
  const [regBus, setRegBus] = useState('Bus-4');
  const [regPvKw, setRegPvKw] = useState<number>(6.5);
  const [regBatteryKwh, setRegBatteryKwh] = useState<number>(10.0);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const handleSelectRoleTab = (role: 'ADMIN' | 'USER') => {
    setRoleTab(role);
    setLoginError(null);
    setLoginSuccessMsg(null);
    if (role === 'ADMIN') {
      setEmail('admin@sg2.grid');
      setPassword('admin123');
    } else {
      setEmail('solar3@sg2.grid');
      setPassword('solar123');
    }
  };

  const handleDemoFill = (preset: { email: string; pass: string; role: 'ADMIN' | 'USER' }) => {
    setRoleTab(preset.role);
    setEmail(preset.email);
    setPassword(preset.pass);
    setLoginError(null);
    setLoginSuccessMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMsg(null);

    const res = AuthService.authenticate(email, password, roleTab);
    if (!res.success || !res.session) {
      setLoginError(res.error || 'Authentication failed. Please verify credentials.');
      return;
    }

    setLoginSuccessMsg(`Authenticated successfully as ${res.session.name}!`);
    setTimeout(() => {
      onLoginSuccess(res.session!);
      if (res.session!.role === 'ADMIN') {
        onNavigateTab('ADMIN_MARKET');
      } else {
        onNavigateTab('USER_PORTAL');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMsg(null);

    const res = AuthService.registerParticipant({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      gridNodeId: regBus,
      pvCapacityKw: regRole === 'PROSUMER' ? regPvKw : 0,
      batteryCapacityKwh: regRole === 'PROSUMER' ? regBatteryKwh : 0,
    });

    if (!res.success || !res.session || !res.account) {
      setRegError(res.error || 'Registration failed.');
      return;
    }

    // Register into simulation runner if callback provided
    if (onRegisterParticipant && res.account) {
      const isProsumer = regRole === 'PROSUMER';
      const newPart: Participant = {
        id: res.account.participantId!,
        name: res.account.name,
        role: isProsumer ? (regPvKw > 8 ? 'PROSUMER_ELITE' : 'PROSUMER_STANDARD') : 'CONSUMER_VULNERABLE',
        gridNodeId: res.account.gridNodeId || regBus,
        wealthTier: isProsumer ? 2 : 3,
        pvCapacityKw: isProsumer ? regPvKw : 0,
        batteryCapacityKwh: isProsumer ? regBatteryKwh : 0,
        batterySoC: isProsumer ? 0.65 : 0,
        batteryMaxPowerKw: isProsumer ? Math.min(5.0, regBatteryKwh * 0.5) : 0,
        baselineDemandKw: 3.2,
        currentGenerationKw: isProsumer ? regPvKw * 0.7 : 0,
        netDemandKw: isProsumer ? 3.2 - regPvKw * 0.7 : 3.2,
        balance: 500, // Initial trading liquidity
        lockedEscrow: 0,
        reputation: {
          alpha: 15,
          beta: 1,
          score: res.account.reputationScore,
          totalTrades: 16,
          fulfilledKwh: 45.0,
          defaultedKwh: 0,
          consecutiveDefaults: 0,
          lastUpdatedEpoch: 1,
        },
      };
      onRegisterParticipant(newPart);
    }

    setRegSuccessMsg(`Registered smart meter ${res.account.did} successfully! Logging in...`);
    setTimeout(() => {
      onLoginSuccess(res.session!);
      onNavigateTab('USER_PORTAL');
    }, 600);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--cyan-400)',
                }}
              >
                <Fingerprint size={22} color="var(--cyan-400)" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Smart Grid 2.0 Cryptographic IAM Portal
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
              Secure DID-authenticated access for <strong>Market Operators</strong> and <strong>P2P Prosumers</strong> with TPM-backed hardware metering.
            </p>
          </div>

          {currentSession.role !== 'SIMULATOR' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <CheckCircle2 size={18} color="var(--cyan-400)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENTLY SIGNED IN</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cyan-400)' }}>
                  {currentSession.name} ({currentSession.role})
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', marginLeft: '0.5rem' }}
                onClick={() => onNavigateTab(currentSession.role === 'ADMIN' ? 'ADMIN_MARKET' : 'USER_PORTAL')}
              >
                Go to {currentSession.role === 'ADMIN' ? 'Admin Console' : 'User Portal'} <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container: Login & Registration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
        {/* Left Column: Login / Register Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          {/* Tab Selector: Login vs Register */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.3rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'LOGIN' ? 'var(--cyan-500)' : 'transparent',
                color: mode === 'LOGIN' ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Lock size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'REGISTER' ? 'var(--purple-500)' : 'transparent',
                color: mode === 'REGISTER' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={15} /> Register New Participant
            </button>
          </div>

          {mode === 'LOGIN' ? (
            <div>
              {/* Role Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('ADMIN')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: roleTab === 'ADMIN' ? '2px solid var(--purple-400)' : '1px solid var(--border)',
                    background: roleTab === 'ADMIN' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: roleTab === 'ADMIN' ? 'var(--purple-400)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Shield size={22} color="var(--purple-400)" />
                  <span>Market Operator (Admin)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grid SCADA &amp; Tariffs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('USER')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: roleTab === 'USER' ? '2px solid var(--cyan-400)' : '1px solid var(--border)',
                    background: roleTab === 'USER' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: roleTab === 'USER' ? 'var(--cyan-400)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <User size={22} color="var(--cyan-400)" />
                  <span>Prosumer / Consumer</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P2P Trading &amp; Wallet</span>
                </button>
              </div>

              {loginError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--red-500)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--red-400)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccessMsg && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid var(--green-500)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--green-400)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                    Registered Email Address:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Password / TPM PIN:</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  <Lock size={16} /> Authenticate &amp; Access {roleTab === 'ADMIN' ? 'Market Console' : 'User Portal'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Registration Form */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Onboard a new physical Smart Meter node into the IEEE 14-bus microgrid topology with DID cryptographic identity.
                </span>
              </div>

              {regError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--red-500)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--red-400)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMsg && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid var(--green-500)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--green-400)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                    Participant / Household Name:
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                      Login Email:
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                      Password:
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                      Microgrid Role:
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
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
                      <option value="PROSUMER">Solar Prosumer (PV + Storage)</option>
                      <option value="CONSUMER">Pure Consumer (Load Only)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                      Grid Feeder Node:
                    </label>
                    <select
                      value={regBus}
                      onChange={(e) => setRegBus(e.target.value)}
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
                      <option value="Bus-2">Bus-2 (High Solar Penetration)</option>
                      <option value="Bus-3">Bus-3 (Commercial)</option>
                      <option value="Bus-4">Bus-4 (Residential Feeder 1)</option>
                      <option value="Bus-5">Bus-5 (Residential Feeder 2)</option>
                      <option value="Bus-7">Bus-7 (Battery Storage Hub)</option>
                      <option value="Bus-12">Bus-12 (EV Fleet Depot)</option>
                    </select>
                  </div>
                </div>

                {regRole === 'PROSUMER' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                        Solar PV Inverter Capacity:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="25"
                          value={regPvKw}
                          onChange={(e) => setRegPvKw(parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kW</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>
                        Battery Storage (ESS):
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="50"
                          value={regBatteryKwh}
                          onChange={(e) => setRegBatteryKwh(parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kWh</span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px dashed var(--border)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-400)', fontWeight: 600 }}>
                    <Cpu size={14} /> Slide 08 Sybil Resistance Onboarding:
                  </div>
                  <div>• Automatic TPM 2.0 endorsement key generation</div>
                  <div>• Bound to unique NMI physical meter point with $150 escrow bond</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem',
                    marginTop: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  <Fingerprint size={16} /> Register Smart Meter &amp; Enter Market
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: 1-Click Fast Login Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={18} color="var(--cyan-400)" />
              1-Click Instant Demo Profiles
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Click any verified identity below to immediately auto-fill credentials and test authentication logic.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Preset 1: Admin */}
              <div
                onClick={() => handleDemoFill({ email: 'admin@sg2.grid', pass: 'admin123', role: 'ADMIN' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} color="var(--purple-400)" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--purple-400)' }}>
                      Market Operator (Admin)
                    </span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>SCADA ADMIN</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Email: <code>admin@sg2.grid</code> | Pass: <code>admin123</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Access: Dynamic tariff ceiling ($0.32), emergency circuit breaker, participant slashing.
                </div>
              </div>

              {/* Preset 2: Solar Prosumer */}
              <div
                onClick={() => handleDemoFill({ email: 'solar3@sg2.grid', pass: 'solar123', role: 'USER' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sun size={18} color="var(--cyan-400)" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--cyan-400)' }}>
                      Alice Solar Prosumer (Node 3)
                    </span>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>PROSUMER</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Email: <code>solar3@sg2.grid</code> | Pass: <code>solar123</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Access: 7.5 kW Solar PV, 13.5 kWh Battery, direct P2P order book bidding &amp; selling.
                </div>
              </div>

              {/* Preset 3: Battery ESS */}
              <div
                onClick={() => handleDemoFill({ email: 'battery7@sg2.grid', pass: 'battery123', role: 'USER' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Battery size={18} color="var(--green-400)" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-400)' }}>
                      Peak Shaving Battery ESS (Node 7)
                    </span>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>STORAGE</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Email: <code>battery7@sg2.grid</code> | Pass: <code>battery123</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Access: 25.0 kWh commercial battery bank for transactive arbitrage &amp; peak injection.
                </div>
              </div>

              {/* Preset 4: Consumer Tenant */}
              <div
                onClick={() => handleDemoFill({ email: 'consumer12@sg2.grid', pass: 'consumer123', role: 'USER' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={18} color="var(--yellow-400)" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--yellow-400)' }}>
                      EV Fleet / Residential Tenant (Node 12)
                    </span>
                  </div>
                  <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>CONSUMER</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Email: <code>consumer12@sg2.grid</code> | Pass: <code>consumer123</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Access: Pure consumer demand, buying green solar energy from neighbors below grid tariff.
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Notes */}
          <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.5)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--cyan-400)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} /> Slide 06 &amp; Slide 08 Architecture
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Authentication guarantees cryptographic non-repudiation. Each participant order submitted in the User Page is committed with a SHA-256 hash salt and signed with the participant's smart meter key.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
