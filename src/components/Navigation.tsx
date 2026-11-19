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
} from 'lucide-react';

export type TabType =
  | 'MARKET'
  | 'FEEDER'
  | 'ADVERSARY'
  | 'FALSE_DATA'
  | 'REPUTATION_MANIP'
  | 'FAIRNESS'
  | 'BLOCKCHAIN'
  | 'BENCHMARKS';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeAttack: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeAttack,
}) => {
  return (
    <nav className="tabs-navigation">
      <button
        className={`tab-btn ${activeTab === 'MARKET' ? 'active' : ''}`}
        onClick={() => onSelectTab('MARKET')}
        id="tab-market"
      >
        <Activity size={18} />
        <span>Control Room &amp; Market</span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'FEEDER' ? 'active' : ''}`}
        onClick={() => onSelectTab('FEEDER')}
        id="tab-feeder"
      >
        <Network size={18} />
        <span>Feeder Map &amp; Congestion</span>
      </button>

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

      <button
        className={`tab-btn ${activeTab === 'FALSE_DATA' ? 'active' : ''}`}
        onClick={() => onSelectTab('FALSE_DATA')}
        id="tab-false-data"
      >
        <Database size={18} color="var(--red-400)" />
        <span>Problem 1: False Data</span>
        <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>ORACLE</span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'REPUTATION_MANIP' ? 'active' : ''}`}
        onClick={() => onSelectTab('REPUTATION_MANIP')}
        id="tab-reputation-manip"
      >
        <Star size={18} color="var(--purple-400)" />
        <span>Problem 3: Fake Rating &amp; Ballot Stuffing</span>
        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>SYBIL</span>
      </button>

      <button
        className={`tab-btn tab-fairness ${activeTab === 'FAIRNESS' ? 'active' : ''}`}
        onClick={() => onSelectTab('FAIRNESS')}
        id="tab-fairness"
      >
        <Scale size={18} />
        <span>Fairness &amp; Justice Audit</span>
        <span className="tab-badge">SPECIAL FOCUS</span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'BLOCKCHAIN' ? 'active' : ''}`}
        onClick={() => onSelectTab('BLOCKCHAIN')}
        id="tab-blockchain"
      >
        <Blocks size={18} />
        <span>Blockchain &amp; Contracts</span>
      </button>

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
