import React from 'react';
import {
  Zap,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sun,
  CloudSun,
  CloudLightning,
  Activity,
  Layers,
  Scale,
  DollarSign,
} from 'lucide-react';
import { SimulationState } from '../core/types';

interface HeaderProps {
  state: SimulationState;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onWeatherChange: (weather: 'SUNNY' | 'PARTLY_CLOUDY' | 'HEAVY_STORM') => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onTogglePlay,
  onStep,
  onReset,
  onWeatherChange,
}) => {
  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${period}`;
  };

  const getHourContext = (h: number) => {
    if (h >= 11 && h <= 14) return 'Solar Generation Peak';
    if (h >= 18 && h <= 21) return 'Evening Demand Peak (Scarcity)';
    if (h >= 7 && h <= 9) return 'Morning Wakeup Load';
    if (h >= 1 && h <= 5) return 'Base Night Load';
    return 'Transactive Period';
  };

  return (
    <header className="header-card">
      <div className="header-top">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="brand-title">Smart Grid 2.0 P2P Energy Market</h1>
            <p className="brand-subtitle">
              Fair, Manipulation-Resistant Transactive Microgrid with Dynamic SDR Pricing &amp; Cryptographic Proofs
            </p>
          </div>
        </div>

        <div className="control-buttons-group">
          <button
            className={`btn ${state.isRunning ? 'btn-secondary' : 'btn-primary'}`}
            onClick={onTogglePlay}
            id="btn-toggle-play"
          >
            {state.isRunning ? <Pause size={16} /> : <Play size={16} />}
            {state.isRunning ? 'Pause 24h Sim' : 'Start 24h Sim'}
          </button>
          <button className="btn btn-secondary" onClick={onStep} id="btn-step-hour">
            <SkipForward size={16} /> Step +1h
          </button>
          <button className="btn btn-secondary" onClick={onReset} id="btn-reset-sim">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Quick KPI Stats Row */}
      <div className="header-stats-row">
        <div className="stat-chip">
          <div className="stat-chip-label">
            <Activity size={14} color="var(--green-400)" /> Active Participants
          </div>
          <div className="stat-chip-value">
            {state.participants.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>nodes</span>
          </div>
        </div>

        <div className="stat-chip">
          <div className="stat-chip-label">
            <Scale size={14} color="var(--cyan-400)" /> Supply-Demand (SDR)
          </div>
          <div className="stat-chip-value" style={{ color: state.marketMetrics.supplyDemandRatio < 0.5 ? 'var(--red-400)' : state.marketMetrics.supplyDemandRatio > 1.5 ? 'var(--green-400)' : 'var(--cyan-400)' }}>
            {state.marketMetrics.supplyDemandRatio.toFixed(2)}x
          </div>
        </div>

        <div className="stat-chip">
          <div className="stat-chip-label">
            <DollarSign size={14} color="var(--amber-400)" /> Dynamic Clearing Price
          </div>
          <div className="stat-chip-value" style={{ color: 'var(--amber-400)' }}>
            ${state.marketMetrics.averageClearedPricePerKwh.toFixed(3)}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/kWh</span>
          </div>
        </div>

        <div className="stat-chip">
          <div className="stat-chip-label">
            <Layers size={14} color="var(--purple-400)" /> Blockchain Ledger
          </div>
          <div className="stat-chip-value" style={{ color: 'var(--purple-400)' }}>
            Block #{state.blockchain.length - 1}
          </div>
        </div>
      </div>

      {/* Real-Time Timeline & Environmental Controls */}
      <div className="control-bar">
        <div className="timeline-info">
          <span className="badge-time">
            Hour {state.hour}:00 ({formatHour(state.hour)})
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Status: <strong style={{ color: '#fff' }}>{getHourContext(state.hour)}</strong>
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Solar Irradiance: {(state.solarIrradiancePu * 100).toFixed(0)}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Weather Condition:
          </span>
          <button
            className={`badge-weather ${state.weatherCondition === 'SUNNY' ? 'weather-sunny' : 'btn-secondary'}`}
            onClick={() => onWeatherChange('SUNNY')}
            style={{ cursor: 'pointer' }}
          >
            <Sun size={14} /> Sunny
          </button>
          <button
            className={`badge-weather ${state.weatherCondition === 'PARTLY_CLOUDY' ? 'weather-partly-cloudy' : 'btn-secondary'}`}
            onClick={() => onWeatherChange('PARTLY_CLOUDY')}
            style={{ cursor: 'pointer' }}
          >
            <CloudSun size={14} /> Partly Cloudy
          </button>
          <button
            className={`badge-weather ${state.weatherCondition === 'HEAVY_STORM' ? 'weather-heavy-storm' : 'btn-secondary'}`}
            onClick={() => onWeatherChange('HEAVY_STORM')}
            style={{ cursor: 'pointer' }}
          >
            <CloudLightning size={14} /> Heavy Storm
          </button>
        </div>
      </div>
    </header>
  );
};
