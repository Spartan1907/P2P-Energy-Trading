import React from 'react';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Eye,
} from 'lucide-react';
import { SimulationState, SystemFairnessPolicies } from '../core/types';

interface FalseDataOracleViewProps {
  state: SimulationState;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
}

export const FalseDataOracleView: React.FC<FalseDataOracleViewProps> = ({
  state,
  onUpdatePolicies,
}) => {
  const rm = state.reputationManipulationMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Problem Statement Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--red-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--red-400)' }}>
              <Database size={20} /> Problem 1 — False Energy &amp; False Data (Oracle Problem)
            </span>
            <span className="card-subtitle">
              Seller A claims 10 kWh available. The physical system can deliver only 4 kWh.
              DATA INTEGRITY ≠ DATA TRUTHFULNESS
            </span>
          </div>
          <span className="badge badge-red">FAILURE MODE</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Blockchain records claims accurately but <strong>cannot guarantee physical truth</strong>.
          A malicious seller can claim large energy availability at attractive prices, lure buyers,
          and then default on delivery — causing <strong>buyer overpays, clearing errors, price distortion, and trust loss</strong>.
        </p>
      </div>

      {/* Visual Diagram: Seller → Ledger → Buyer Flow */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Eye size={18} color="var(--amber-400)" /> False Data Attack Flow Visualization
          </span>
          <span className="badge badge-amber">LIVE SIMULATION</span>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            overflowX: 'auto',
          }}
        >
          <svg viewBox="0 0 900 200" style={{ width: '100%', minWidth: '750px', height: '200px' }}>
            {/* Seller A Box */}
            <rect x="40" y="60" width="200" height="80" rx="12" fill="rgba(6, 182, 212, 0.15)" stroke="var(--cyan-400)" strokeWidth="2" />
            <text x="140" y="88" fill="var(--cyan-400)" fontSize="12" fontWeight="700" textAnchor="middle">SELLER A</text>
            <text x="140" y="108" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">CLAIMS 10 kWh</text>
            <text x="140" y="128" fill="var(--text-muted)" fontSize="10" textAnchor="middle">At attractive undercut price</text>

            {/* Arrow 1 */}
            <line x1="240" y1="100" x2="340" y2="100" stroke="#475569" strokeWidth="3" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>

            {/* Ledger Record Box */}
            <rect x="340" y="60" width="220" height="80" rx="12" fill="rgba(139, 92, 246, 0.15)" stroke="var(--purple-400)" strokeWidth="2" />
            <text x="450" y="88" fill="var(--purple-400)" fontSize="12" fontWeight="700" textAnchor="middle">LEDGER RECORD</text>
            <text x="450" y="108" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">10 kWh CLAIM</text>
            <text x="450" y="128" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Blockchain records claim accurately</text>

            {/* Arrow 2 */}
            <line x1="560" y1="100" x2="650" y2="100" stroke="#475569" strokeWidth="3" markerEnd="url(#arrowhead)" />

            {/* Buyer Box */}
            <rect x="650" y="60" width="200" height="80" rx="12" fill="rgba(245, 158, 11, 0.15)" stroke="var(--amber-400)" strokeWidth="2" />
            <text x="750" y="88" fill="var(--amber-400)" fontSize="12" fontWeight="700" textAnchor="middle">BUYER</text>
            <text x="750" y="108" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">PAYS FOR 10 kWh</text>
            <text x="750" y="128" fill="var(--red-400)" fontSize="10" textAnchor="middle">Gets only 4 kWh delivered!</text>

            {/* Physical Output Box */}
            <rect x="140" y="155" width="200" height="40" rx="8" fill="rgba(239, 68, 68, 0.15)" stroke="var(--red-400)" strokeWidth="2" strokeDasharray="6 3" />
            <text x="240" y="180" fill="var(--red-400)" fontSize="12" fontWeight="700" textAnchor="middle">PHYSICAL OUTPUT: ONLY 4 kWh</text>

            {/* Dashed line from seller to physical */}
            <line x1="140" y1="140" x2="240" y2="155" stroke="var(--red-400)" strokeWidth="2" strokeDasharray="5 5" />
          </svg>
        </div>
      </div>

      {/* Comparative Analysis */}
      <div className="panel-grid">
        {/* Vulnerable Baseline */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--red-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={18} color="var(--red-400)" /> Vulnerable Baseline (No Oracle)
            </span>
            <span className="badge badge-red">EXPLOITABLE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Without smart meter oracle cross-verification, the blockchain blindly trusts seller claims:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">False Energy Claimed</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE' ? '18.0 kWh (10 + 8 kWh falsified)' : '0 kWh'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Actual Physical Output</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)', fontSize: '1.05rem' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE' ? 'Only 7.0 kWh (60% violation rate)' : 'Normal Delivery'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Buyer Financial Impact</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE' ? 'Buyer overpays 150%+ for undelivered energy' : 'No Impact'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Defense Effectiveness</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE' ? '0% (No Verification)' : '100%'}
              </div>
            </div>
          </div>
        </div>

        {/* Defended System */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--green-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={18} color="var(--green-400)" /> SG2.0 Oracle-Verified System
            </span>
            <span className="badge badge-green">DEFENDED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Smart Meter Oracle cross-checks claimed energy against physical meter readings before settlement:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Oracle Verification Rate</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {rm.oracleVerificationRate > 0 ? `${rm.oracleVerificationRate}%` : '94.5% (When Enabled)'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">False Claims Detected & Capped</div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)', fontSize: '1.05rem' }}>
                {rm.falseDataPenaltiesApplied > 0
                  ? `${rm.falseDataPenaltiesApplied} false orders capped to actual capacity`
                  : 'Oracle caps sell orders to verified meter capacity'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Data Integrity Violation Detected</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {rm.dataIntegrityViolationRate > 0
                  ? `${rm.dataIntegrityViolationRate}% discrepancy flagged & blocked`
                  : '60% violation rate would be caught'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Collateral Action</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                Escrow slashed + reputation degraded for false claims ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
        <div className="card-header">
          <span className="card-title">
            <AlertTriangle size={18} color="var(--purple-400)" /> Key Research Insight
          </span>
          <span className="badge badge-purple">DATA TRUTHFULNESS</span>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>DATA INTEGRITY ≠ DATA TRUTHFULNESS</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Blockchain records claims accurately but <strong>cannot guarantee physical truth</strong>.
            A tamper-proof ledger ensures that recorded data has not been altered (integrity), but it cannot verify
            that the data was truthful in the first place. This is the fundamental <strong>Oracle Problem</strong> in
            decentralized energy markets.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>SG2.0 Solution:</strong> Smart Meter DID Oracle attestation cross-checks physical meter readings
            against blockchain claims at settlement time. Combined with capacity-proportional collateral staking,
            false claimants face automatic escrow slashing that makes cheating economically irrational.
          </p>
        </div>
      </div>

      {/* Defense Controls */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Zap size={18} color="var(--cyan-400)" /> Oracle Verification Defense Controls
          </span>
          <span className="badge badge-cyan">CONFIGURABLE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div
            className="toggle-wrapper"
            onClick={() =>
              onUpdatePolicies({
                oracleVerificationEnabled: !state.fairnessPolicies.oracleVerificationEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Smart Meter Oracle Verification</span>
              <span className="toggle-desc">Cross-check claimed energy against physical smart meter DID readings before settlement</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.oracleVerificationEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          <div
            className="toggle-wrapper"
            onClick={() =>
              onUpdatePolicies({
                dynamicStakingEnabled: !state.fairnessPolicies.dynamicStakingEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Capacity-Proportional Collateral Staking</span>
              <span className="toggle-desc">Require escrow bonds proportional to claimed capacity — makes false claims costly</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.dynamicStakingEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Live Metrics Table */}
      {state.activeAttack === 'FALSE_DATA_ORACLE' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={18} color="var(--green-400)" /> Live Oracle Verification Metrics
            </span>
            <span className="badge badge-green">EPOCH {state.epoch}</span>
          </div>

          <div className="header-stats-row">
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--red-400)' }}>
              <div className="stat-chip-label">False Claims (kWh)</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>{rm.falseDataClaimsKwh.toFixed(1)}</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--amber-400)' }}>
              <div className="stat-chip-label">Actual Capacity (kWh)</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)' }}>{rm.actualDeliveredKwh.toFixed(1)}</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--cyan-400)' }}>
              <div className="stat-chip-label">Violation Rate</div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)' }}>{rm.dataIntegrityViolationRate.toFixed(1)}%</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--green-400)' }}>
              <div className="stat-chip-label">Oracle Verification</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>{rm.oracleVerificationRate.toFixed(1)}%</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--purple-400)' }}>
              <div className="stat-chip-label">Penalties Applied</div>
              <div className="stat-chip-value" style={{ color: 'var(--purple-400)' }}>{rm.falseDataPenaltiesApplied}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
