import React from 'react';
import {
  Activity,
  Network,
  ShieldAlert,
  Scale,
  Blocks,
  Award,
  Database,
  Star,
  Users,
  Shield,
  User,
} from 'lucide-react';
import { AuthSession } from './AuthLoginModal';

export type TabType =
  | 'MARKET'
  | 'ADMIN_MARKET'
  | 'USER_PORTAL'
  | 'FALSE_DATA'
  | 'SYBIL_SOLUTION'
  | 'REPUTATION_MANIP'
  | 'FEEDER'
  | 'ADVERSARY'
  | 'FAIRNESS'
  | 'BLOCKCHAIN'
  | 'BENCHMARKS';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeAttack: string;
  currentSession: AuthSession;
  onOpenLogin: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeAttack,
  currentSession,
  onOpenLogin,
}) => {
  return (
    <nav className="tabs-navigation">
      {/* 1. Main Simulator */}
      <button
        className={`tab-btn ${activeTab === 'MARKET' ? 'active' : ''}`}
        onClick={() => onSelectTab('MARKET')}
        id="tab-market"
      >
        <Activity size={18} />
        <span>Simulator: Market &amp; Control Room</span>
      </button>

      {/* 2. Admin Portal */}
      <button
        className={`tab-btn ${activeTab === 'ADMIN_MARKET' ? 'active' : ''}`}
        onClick={() => onSelectTab('ADMIN_MARKET')}
        id="tab-admin-market"
        style={{
          borderLeft: '2px solid var(--purple-400)',
          background: activeTab === 'ADMIN_MARKET' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.08)',
        }}
      >
        <Shield size={18} color="var(--purple-400)" />
        <span style={{ color: 'var(--purple-400)', fontWeight: 700 }}>Admin Page (Market)</span>
        <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>OPERATOR</span>
      </button>

      {/* 3. User Portal */}
      <button
        className={`tab-btn ${activeTab === 'USER_PORTAL' ? 'active' : ''}`}
        onClick={() => onSelectTab('USER_PORTAL')}
        id="tab-user-portal"
        style={{
          borderLeft: '2px solid var(--cyan-400)',
          background: activeTab === 'USER_PORTAL' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.08)',
        }}
      >
        <User size={18} color="var(--cyan-400)" />
        <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>User Page (P2P Hub)</span>
        <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>PROSUMER</span>
      </button>

      {/* 4. Problem 1: False Data */}
      <button
        className={`tab-btn ${activeTab === 'FALSE_DATA' ? 'active' : ''}`}
        onClick={() => onSelectTab('FALSE_DATA')}
        id="tab-false-data"
      >
        <Database size={18} color="var(--red-400)" />
        <span>Problem 1: False Data (Oracle)</span>
        <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>ORACLE</span>
      </button>

      {/* 5. Problem 3: Sybil Solution */}
      <button
        className={`tab-btn ${activeTab === 'SYBIL_SOLUTION' ? 'active' : ''}`}
        onClick={() => onSelectTab('SYBIL_SOLUTION')}
        id="tab-sybil-solution"
      >
        <Users size={18} color="var(--cyan-400)" />
        <span>Problem 3: Sybil Attack Solution</span>
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>5-PILLAR DEFENSE</span>
      </button>

      {/* 6. Reputation & Ballot Stuffing */}
      <button
        className={`tab-btn ${activeTab === 'REPUTATION_MANIP' ? 'active' : ''}`}
        onClick={() => onSelectTab('REPUTATION_MANIP')}
        id="tab-reputation-manip"
      >
        <Star size={18} color="var(--purple-400)" />
        <span>Reputation: Fake Ratings &amp; Ballot Stuffing</span>
        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>TRUST</span>
      </button>

      {/* 7. Feeder Map */}
      <button
        className={`tab-btn ${activeTab === 'FEEDER' ? 'active' : ''}`}
        onClick={() => onSelectTab('FEEDER')}
        id="tab-feeder"
      >
        <Network size={18} />
        <span>Feeder Map &amp; Congestion</span>
      </button>

      {/* 8. Adversary Sandbox */}
      <button
        className={`tab-btn ${activeTab === 'ADVERSARY' ? 'active' : ''}`}
        onClick={() => onSelectTab('ADVERSARY')}
        id="tab-adversary"
      >
        <ShieldAlert size={18} />
        <span>Adversarial Sandbox</span>
        {activeAttack !== 'NONE' && (
          <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
            {activeAttack}
          </span>
        )}
      </button>

      {/* 9. Fairness & Justice */}
      <button
        className={`tab-btn tab-fairness ${activeTab === 'FAIRNESS' ? 'active' : ''}`}
        onClick={() => onSelectTab('FAIRNESS')}
        id="tab-fairness"
      >
        <Scale size={18} />
        <span>Fairness &amp; Justice Audit</span>
        <span className="tab-badge">SPECIAL FOCUS</span>
      </button>

      {/* 10. Blockchain Ledger */}
      <button
        className={`tab-btn ${activeTab === 'BLOCKCHAIN' ? 'active' : ''}`}
        onClick={() => onSelectTab('BLOCKCHAIN')}
        id="tab-blockchain"
      >
        <Blocks size={18} />
        <span>Blockchain &amp; Contracts</span>
      </button>

      {/* 11. Benchmarks */}
      <button
        className={`tab-btn ${activeTab === 'BENCHMARKS' ? 'active' : ''}`}
        onClick={() => onSelectTab('BENCHMARKS')}
        id="tab-benchmarks"
      >
        <Award size={18} />
        <span>Research RQ1-RQ4</span>
      </button>
    </nav>
  );
};
