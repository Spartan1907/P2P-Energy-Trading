import React from 'react';
import {
  Scale,
  Users,
  Sun,
  DollarSign,
  TrendingDown,
  Lock,
} from 'lucide-react';
import { SimulationState, SystemFairnessPolicies } from '../core/types';

interface FairnessAuditViewProps {
  state: SimulationState;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
}

export const FairnessAuditView: React.FC<FairnessAuditViewProps> = ({
  state,
  onUpdatePolicies,
}) => {
  const f = state.fairnessMetrics;
  const p = state.fairnessPolicies;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner: Addressing User Special Request */}
      <div className="card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--amber-400)' }}>
              <Scale size={20} /> Fairness &amp; Energy Justice Audit (Deep-Dive Analysis)
            </span>
            <span className="card-subtitle">
              Evaluating and mitigating 5 fundamental failure modes where decentralized P2P energy trading becomes unfair for participants
            </span>
          </div>
          <span className="badge badge-amber">SPECIAL RESEARCH FOCUS</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          While blockchain and dynamic double auctions maximize economic efficiency, <strong>pure transactive markets are not socially neutral</strong>.
          Without careful energy justice design, dynamic pricing punishes vulnerable consumers during peak scarcity, penalizes distant nodes for grid physics,
          and traps low-resource prosumers in reputation poverty traps.
        </p>
      </div>

      {/* Real-Time Fairness Gauges Row */}
      <div className="header-stats-row">
        <div className="stat-chip" style={{ borderLeft: '3px solid var(--green-400)' }}>
          <div className="stat-chip-label">
            <Scale size={14} color="var(--green-400)" /> Jain&apos;s Fairness Index
          </div>
          <div className="stat-chip-value" style={{ color: f.jainsFairnessIndex > 0.85 ? 'var(--green-400)' : 'var(--amber-400)' }}>
            {f.jainsFairnessIndex.toFixed(3)}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / 1.000</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {f.jainsFairnessIndex > 0.85 ? 'High Social Equity ✅' : 'Significant Disparity ⚠️'}
          </div>
        </div>

        <div className="stat-chip" style={{ borderLeft: '3px solid var(--cyan-400)' }}>
          <div className="stat-chip-label">
            <TrendingDown size={14} color="var(--cyan-400)" /> Gini Coefficient
          </div>
          <div className="stat-chip-value" style={{ color: f.giniCoefficient < 0.25 ? 'var(--green-400)' : 'var(--red-400)' }}>
            {f.giniCoefficient.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {f.giniCoefficient < 0.25 ? 'Equal Surplus Distribution' : 'Skewed Surplus Distribution'}
          </div>
        </div>

        <div className="stat-chip" style={{ borderLeft: '3px solid var(--amber-400)' }}>
          <div className="stat-chip-label">
            <Users size={14} color="var(--amber-400)" /> Green Wealth Divide Ratio
          </div>
          <div className="stat-chip-value" style={{ color: f.wealthDivideRatio > 8.0 ? 'var(--red-400)' : 'var(--amber-400)' }}>
            {f.wealthDivideRatio.toFixed(1)}x
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Tier 1 Prosumer Utility vs Tier 3 Consumer
          </div>
        </div>

        <div className="stat-chip" style={{ borderLeft: '3px solid var(--purple-400)' }}>
          <div className="stat-chip-label">
            <DollarSign size={14} color="var(--purple-400)" /> Edge vs Substation Price Parity
          </div>
          <div className="stat-chip-value" style={{ color: f.edgeToSubstationPriceRatio > 1.15 ? 'var(--red-400)' : 'var(--green-400)' }}>
            {f.edgeToSubstationPriceRatio.toFixed(2)}x
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {f.edgeToSubstationPriceRatio > 1.15 ? 'Geographic Penalty Present' : 'Geographic Equity Maintained'}
          </div>
        </div>
      </div>

      {/* The 5 Unfairness Cases Grid */}
      <div className="panel-grid">
        {/* Case 1: Green Wealth Divide */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <Users size={18} color="var(--amber-400)" /> 1. The Green Wealth Divide (Capital Disparity)
            </span>
            <span className="badge badge-amber">ASSET GAP</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Why it&apos;s unfair:</strong> Wealthy households afford large rooftop PV (10&ndash;15 kW) and battery storage (20 kWh).
            They arbitrage dynamic prices: selling at high prices during peak demand and charging during surplus troughs.
            Low-income tenants/consumers with 0 kW solar have inelastic essential loads and get squeezed by peak price spikes.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span>Tier 1 Elite Prosumer Average Utility:</span>
              <strong style={{ color: 'var(--green-400)' }}>${f.tier1Utility.toFixed(2)}/h</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Tier 3 Vulnerable Consumer Average Utility:</span>
              <strong style={{ color: 'var(--red-400)' }}>${f.tier3Utility.toFixed(2)}/h</strong>
            </div>
          </div>
          <div
            className="toggle-wrapper"
            onClick={() => onUpdatePolicies({ lifelineQuotaEnabled: !p.lifelineQuotaEnabled })}
          >
            <div className="toggle-label">
              <span className="toggle-title">Policy: Lifeline Energy Quota</span>
              <span className="toggle-desc">Guarantees 2.0 kWh/h essential power for Tier 3 at a 25% discount</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={p.lifelineQuotaEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Case 2: Feeder Edge Unfairness */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <DollarSign size={18} color="var(--red-400)" /> 2. Topological &amp; Feeder Edge Congestion Penalties
            </span>
            <span className="badge badge-red">GRID PHYSICS</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Why it&apos;s unfair:</strong> Households at terminal feeder nodes (B7, B8) experience higher line resistance (0.95 &Omega;)
            and voltage drop. Under unmitigated D-LMP, edge nodes are charged steep congestion surcharges or face curtailment
            simply due to physical geography, while central nodes near the substation trade frictionlessly.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span>Edge Node Congestion Fee Share:</span>
              <strong style={{ color: 'var(--red-400)' }}>{f.congestionBurdenEdgeShare.toFixed(1)}% of total fees</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Edge / Substation Price Disparity:</span>
              <strong style={{ color: 'var(--amber-400)' }}>{f.edgeToSubstationPriceRatio.toFixed(2)}x</strong>
            </div>
          </div>
          <div
            className="toggle-wrapper"
            onClick={() => onUpdatePolicies({ congestionSocializationEnabled: !p.congestionSocializationEnabled })}
          >
            <div className="toggle-label">
              <span className="toggle-title">Policy: Feeder Congestion Socialization Fund</span>
              <span className="toggle-desc">Pools congestion fees across all nodes to rebate edge households</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={p.congestionSocializationEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Case 3: Reputation Cold-Start Trap */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <Lock size={18} color="var(--cyan-400)" /> 3. Reputation Cold-Start &amp; Poverty Trap
            </span>
            <span className="badge badge-cyan">HISTORY BIAS</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Why it&apos;s unfair:</strong> Entrenched prosumers with high reputation scores enjoy match priority and price markups.
            New entrants or small prosumers who suffered a single glitch are systematically bypassed by double auction sorting,
            leaving them unable to build or restore trust.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Cold-Start Match Escape Rate:</span>
              <strong style={{ color: f.coldStartEscapeRate > 60 ? 'var(--green-400)' : 'var(--amber-400)' }}>
                {f.coldStartEscapeRate.toFixed(1)}%
              </strong>
            </div>
          </div>
          <div
            className="toggle-wrapper"
            onClick={() => onUpdatePolicies({ dynamicStakingEnabled: !p.dynamicStakingEnabled })}
          >
            <div className="toggle-label">
              <span className="toggle-title">Policy: Dynamic Progressive Staking</span>
              <span className="toggle-desc">Replaces flat regressive collateral with capacity-scaled bonds</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={p.dynamicStakingEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Case 4: Weather Stochasticity Slashing */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <Sun size={18} color="var(--purple-400)" /> 4. Stochastic Weather Intermittency Penalties
            </span>
            <span className="badge badge-purple">STOCHASTIC SHOCKS</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Why it&apos;s unfair:</strong> Sudden clouds drop solar generation unexpectedly. Strict default-slashing rules designed
            to punish malicious phantom energy bidders indiscriminately penalize honest small solar owners, while wealthy battery owners
            can buffer solar dips effortlessly.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Unexcused Weather Penalties:</span>
              <strong style={{ color: f.weatherShockFalsePenaltyCount > 0 ? 'var(--red-400)' : 'var(--green-400)' }}>
                {f.weatherShockFalsePenaltyCount > 0
                  ? `${f.weatherShockFalsePenaltyCount} honest solar homes slashed ❌`
                  : '0 false penalties (Forgiven via consensus) ✅'}
              </strong>
            </div>
          </div>
          <div
            className="toggle-wrapper"
            onClick={() => onUpdatePolicies({ weatherForgivenessEnabled: !p.weatherForgivenessEnabled })}
          >
            <div className="toggle-label">
              <span className="toggle-title">Policy: Neighborhood Weather Consensus</span>
              <span className="toggle-desc">Cross-validates feeder-wide solar drops to waive slashing penalties</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={p.weatherForgivenessEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
