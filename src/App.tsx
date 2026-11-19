import React, { useState, useEffect, useRef } from 'react';
import { SimulationRunner } from './core/simulationRunner';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LiveMarketView } from './components/LiveMarketView';
import { FeederMapView } from './components/FeederMapView';
import { AdversarySandboxView } from './components/AdversarySandboxView';
import { FalseDataOracleView } from './components/FalseDataOracleView';
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

  return (
    <div className="app-container">
      <Header
        state={simState}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onReset={handleReset}
        onWeatherChange={handleWeatherChange}
      />

      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAttack={simState.activeAttack}
      />

      <main style={{ marginTop: '0.25rem' }}>
        {activeTab === 'MARKET' && <LiveMarketView state={simState} />}
        {activeTab === 'FEEDER' && <FeederMapView state={simState} />}
        {activeTab === 'ADVERSARY' && (
          <AdversarySandboxView
            state={simState}
            onSelectAttack={handleSelectAttack}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}
        {activeTab === 'FALSE_DATA' && (
          <FalseDataOracleView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}
        {activeTab === 'REPUTATION_MANIP' && (
          <ReputationManipulationView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}
        {activeTab === 'FAIRNESS' && (
          <FairnessAuditView
            state={simState}
            onUpdatePolicies={handleUpdatePolicies}
          />
        )}
        {activeTab === 'BLOCKCHAIN' && <BlockchainLedgerView state={simState} />}
        {activeTab === 'BENCHMARKS' && <ResearchBenchmarkView state={simState} />}
      </main>
    </div>
  );
};

export default App;
