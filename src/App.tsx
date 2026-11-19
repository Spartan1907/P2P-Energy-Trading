import React, { useState, useEffect, useRef } from 'react';
import { SimulationRunner } from './core/simulationRunner';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LiveMarketView } from './components/LiveMarketView';
import { AdminMarketView } from './components/AdminMarketView';
import { UserPortalView } from './components/UserPortalView';
import { AuthLoginModal, AuthSession } from './components/AuthLoginModal';
import { FeederMapView } from './components/FeederMapView';
import { AdversarySandboxView } from './components/AdversarySandboxView';
import { FalseDataOracleView } from './components/FalseDataOracleView';
import { SybilAttackSolutionView } from './components/SybilAttackSolutionView';
import { ReputationManipulationView } from './components/ReputationManipulationView';
import { FairnessAuditView } from './components/FairnessAuditView';
import { BlockchainLedgerView } from './components/BlockchainLedgerView';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { AttackType, SystemFairnessPolicies } from './core/types';

export const App: React.FC = () => {
  const runnerRef = useRef<SimulationRunner | null>(null);
  if (!runnerRef.current) {
    runnerRef.current = new SimulationRunner(24);
  }

  const [simState, setSimState] = useState(runnerRef.current.getState());
  const [activeTab, setActiveTab] = useState<TabType>('MARKET');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [authSession, setAuthSession] = useState<AuthSession>({
    role: 'SIMULATOR',
    username: 'guest',
    name: 'Guest Observer',
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
    setAuthSession(session);
    if (session.role === 'ADMIN') {
      setActiveTab('ADMIN_MARKET');
    } else if (session.role === 'USER') {
      setActiveTab('USER_PORTAL');
    }
  };

  const handleLogout = () => {
    setAuthSession({
      role: 'SIMULATOR',
      username: 'guest',
      name: 'Guest Observer',
    });
    setActiveTab('MARKET');
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
          <AdminMarketView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
            onStep={handleStep}
            onTogglePlay={handleTogglePlay}
          />
        )}

        {/* 3. User P2P Portal Page */}
        {activeTab === 'USER_PORTAL' && (
          <UserPortalView
            state={simState}
            activeUserId={authSession.participantId || 'node_user_3'}
            onSelectUser={(id) => setAuthSession((prev) => ({ ...prev, participantId: id }))}
            onSubmitOrder={handleSubmitOrder}
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
