import React, { useState, useEffect, useRef } from 'react';
import { SimulationRunner } from './core/simulationRunner';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LiveMarketView } from './components/LiveMarketView';
import { AdminMarketView } from './components/AdminMarketView';
import { UserPortalView } from './components/UserPortalView';
import { LoginPageView } from './components/LoginPageView';
import { AuthLoginModal } from './components/AuthLoginModal';
import { AuthService, AuthSession } from './core/authService';
import { FeederMapView } from './components/FeederMapView';
import { AdversarySandboxView } from './components/AdversarySandboxView';
import { FalseDataOracleView } from './components/FalseDataOracleView';
import { SybilAttackSolutionView } from './components/SybilAttackSolutionView';
import { ReputationManipulationView } from './components/ReputationManipulationView';
import { FairnessAuditView } from './components/FairnessAuditView';
import { BlockchainLedgerView } from './components/BlockchainLedgerView';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { AttackType, SystemFairnessPolicies, Participant } from './core/types';
import { Shield, User, Zap, Sun } from 'lucide-react';

export const App: React.FC = () => {
  const runnerRef = useRef<SimulationRunner | null>(null);
  if (!runnerRef.current) {
    runnerRef.current = new SimulationRunner(24);
  }

  const [simState, setSimState] = useState(runnerRef.current.getState());
  const [activeTab, setActiveTab] = useState<TabType>('MARKET');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    const saved = AuthService.getStoredSession();
    return (
      saved || {
        role: 'SIMULATOR',
        username: 'guest',
        name: 'Guest Observer',
      }
    );
  });

  // Periodic simulation loop when isRunning is true
  useEffect(() => {
    let timer: any = null;
    if (simState.isRunning && runnerRef.current) {
      timer = setInterval(() => {
        const nextState = runnerRef.current!.step();
        setSimState({ ...nextState });
      }, simState.speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [simState.isRunning, simState.speedMs]);

  const handleTogglePlay = () => {
    if (!runnerRef.current) return;
    const current = runnerRef.current.getState();
    current.isRunning = !current.isRunning;
    setSimState({ ...current });
  };

  const handleStep = () => {
    if (!runnerRef.current) return;
    const nextState = runnerRef.current.step();
    setSimState({ ...nextState });
  };

  const handleReset = () => {
    runnerRef.current = new SimulationRunner(24);
    setSimState(runnerRef.current.getState());
  };

  const handleWeatherChange = (weather: 'SUNNY' | 'PARTLY_CLOUDY' | 'HEAVY_STORM') => {
    if (!runnerRef.current) return;
    runnerRef.current.setWeatherCondition(weather);
    setSimState({ ...runnerRef.current.getState() });
  };

  const handleSelectAttack = (attack: AttackType) => {
    if (!runnerRef.current) return;
    runnerRef.current.setActiveAttack(attack);
    setSimState({ ...runnerRef.current.getState() });
  };

  const handleUpdatePolicies = (policies: Partial<SystemFairnessPolicies>) => {
    if (!runnerRef.current) return;
    runnerRef.current.setFairnessPolicies(policies);
    setSimState({ ...runnerRef.current.getState() });
  };

  const handleSubmitOrder = (params: {
    participantId: string;
    type: 'BUY' | 'SELL';
    energyKwh: number;
    pricePerKwh: number;
    gridNodeId?: string;
  }) => {
    if (!runnerRef.current) return { success: false, orderId: '', message: 'Simulation not initialized' };
    const res = runnerRef.current.submitUserOrder(params);
    setSimState({ ...runnerRef.current.getState() });
    return res;
  };

  const handleLogin = (session: AuthSession) => {
    AuthService.storeSession(session);
    setAuthSession(session);
    if (session.role === 'ADMIN') {
      setActiveTab('ADMIN_MARKET');
    } else if (session.role === 'USER') {
      setActiveTab('USER_PORTAL');
    }
  };

  const handleLogout = () => {
    AuthService.clearSession();
    setAuthSession({
      role: 'SIMULATOR',
      username: 'guest',
      name: 'Guest Observer',
    });
    setActiveTab('MARKET');
  };

  const handleRegisterParticipant = (newParticipant: Participant) => {
    if (!runnerRef.current) return;
    runnerRef.current.registerParticipant(newParticipant);
    setSimState({ ...runnerRef.current.getState() });
  };

  return (
    <div className="app-container">
      <Header
        state={simState}
        currentSession={authSession}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onReset={handleReset}
        onWeatherChange={handleWeatherChange}
      />

      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAttack={simState.activeAttack}
        currentSession={authSession}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main style={{ marginTop: '0.25rem' }}>
        {/* 1. Main Simulator */}
        {activeTab === 'MARKET' && (
          <LiveMarketView
            state={simState}
            onSubmitOrder={handleSubmitOrder}
          />
        )}

        {/* 2. Admin Market Governance Page */}
        {activeTab === 'ADMIN_MARKET' && (
          authSession.role === 'ADMIN' ? (
            <AdminMarketView
              state={simState}
              onUpdatePolicies={handleUpdatePolicies}
              onStep={handleStep}
              onTogglePlay={handleTogglePlay}
            />
          ) : (
            <div className="card" style={{ maxWidth: '780px', margin: '2rem auto', padding: '2.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  border: '1px solid var(--purple-400)',
                }}
              >
                <Shield size={32} color="var(--purple-400)" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                Market Operator Authorization Required
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.75rem', lineHeight: '1.5', fontSize: '0.92rem' }}>
                You are currently viewing as a guest/unauthenticated identity. Adjusting dynamic feed-in tariff ceilings ($0.32/kWh), dispatching emergency circuit breakers, and slashing malicious DIDs requires verified <strong>Market Operator (Admin)</strong> credentials.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    const res = AuthService.authenticate('admin@sg2.grid', 'admin123', 'ADMIN');
                    if (res.session) handleLogin(res.session);
                  }}
                >
                  <Zap size={16} /> Fast Sign In as Market Operator
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                  onClick={() => setActiveTab('LOGIN')}
                >
                  Open IAM &amp; Login Page
                </button>
              </div>
            </div>
          )
        )}

        {/* 3. User P2P Portal Page */}
        {activeTab === 'USER_PORTAL' && (
          authSession.role === 'USER' ? (
            <UserPortalView
              state={simState}
              activeUserId={authSession.participantId || 'node_user_3'}
              onSelectUser={(id) => setAuthSession((prev) => ({ ...prev, participantId: id }))}
              onSubmitOrder={handleSubmitOrder}
            />
          ) : (
            <div className="card" style={{ maxWidth: '780px', margin: '2rem auto', padding: '2.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  border: '1px solid var(--cyan-400)',
                }}
              >
                <User size={32} color="var(--cyan-400)" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                Prosumer / Consumer Authorization Required
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.75rem', lineHeight: '1.5', fontSize: '0.92rem' }}>
                To place double-auction buy/sell orders, view live household generation telemetry, and claim smart contract settlements, please sign in to your registered <strong>Smart Meter</strong> account.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    const res = AuthService.authenticate('solar3@sg2.grid', 'solar123', 'USER');
                    if (res.session) handleLogin(res.session);
                  }}
                >
                  <Sun size={16} /> Fast Sign In as Alice Prosumer (Node 3)
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                  onClick={() => setActiveTab('LOGIN')}
                >
                  Open IAM &amp; Login Page
                </button>
              </div>
            </div>
          )
        )}

        {/* 4. Login & IAM Portal */}
        {activeTab === 'LOGIN' && (
          <LoginPageView
            currentSession={authSession}
            onLoginSuccess={handleLogin}
            onRegisterParticipant={handleRegisterParticipant}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* 4. Problem 1: False Data (Oracle) */}
        {activeTab === 'FALSE_DATA' && (
          <FalseDataOracleView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {/* 5. Problem 3: Sybil Solution */}
        {activeTab === 'SYBIL_SOLUTION' && (
          <SybilAttackSolutionView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {/* 6. Reputation & Ballot Stuffing */}
        {activeTab === 'REPUTATION_MANIP' && (
          <ReputationManipulationView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {/* 7. Feeder Map */}
        {activeTab === 'FEEDER' && <FeederMapView state={simState} />}

        {/* 8. Adversary Sandbox */}
        {activeTab === 'ADVERSARY' && (
          <AdversarySandboxView
            state={simState}
            onSelectAttack={handleSelectAttack}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {/* 9. Fairness & Justice Audit */}
        {activeTab === 'FAIRNESS' && (
          <FairnessAuditView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}

        {/* 10. Blockchain Ledger */}
        {activeTab === 'BLOCKCHAIN' && <BlockchainLedgerView state={simState} />}

        {/* 11. Benchmarks */}
        {activeTab === 'BENCHMARKS' && <ResearchBenchmarkView state={simState} />}
      </main>

      {/* Login Modal */}
      <AuthLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        participants={simState.participants}
      />
    </div>
  );
};

export default App;
