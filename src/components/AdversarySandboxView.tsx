import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  AlertOctagon,
  RefreshCw,
  Flame,
  Database,
  Star,
} from 'lucide-react';
import { SimulationState, AttackType, SystemFairnessPolicies } from '../core/types';

interface AdversarySandboxViewProps {
  state: SimulationState;
  onSelectAttack: (attack: AttackType) => void;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
}

export const AdversarySandboxView: React.FC<AdversarySandboxViewProps> = ({
  state,
  onSelectAttack,
  onUpdatePolicies,
}) => {
  const attacks: { id: AttackType; label: string; icon: any; summary: string }[] = [
    {
      id: 'NONE',
      label: 'Honest Baseline (No Attack)',
      icon: ShieldCheck,
      summary: 'All participants submit truthful bids and fulfill contracted energy deliveries.',
    },
    {
      id: 'FALSE_DATA_ORACLE',
      label: 'Problem 1: False Data (Oracle)',
      icon: Database,
      summary: 'Seller claims 10 kWh available but physically outputs 4 kWh. Tests Data Integrity vs Data Truthfulness.',
    },
    {
      id: 'FAKE_RATING_BALLOT',
      label: 'Problem 3: Fake Rating & Ballot Stuffing',
      icon: Star,
      summary: 'One real participant spawns A1-A4 puppets to cast 20 fake ratings and stuff ballots (+68% rep inflation).',
    },
    {
      id: 'SYBIL',
      label: 'Sybil Flooding Attack',
      icon: Users,
      summary: 'Attacker generates 6+ phantom sub-accounts to manipulate SDR and capture disproportionate trades.',
    },
    {
      id: 'SELLER_CARTEL',
      label: 'Collusive Seller Cartel',
      icon: AlertOctagon,
      summary: 'Top prosumers collude off-chain: withhold 40% capacity and pump ask prices by 35%.',
    },
    {
      id: 'WASH_TRADING',
      label: 'Wash Trading Reputation Ring',
      icon: RefreshCw,
      summary: 'Colluding nodes execute circular fake trades to artificially inflate Beta reputation scores.',
    },
    {
      id: 'PHANTOM_ENERGY',
      label: 'Phantom Energy Default',
      icon: Flame,
      summary: 'Attacker promises large cheap solar energy they cannot deliver, intending to collect escrow.',
    },
  ];

  const rm = state.reputationManipulationMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Attack Selector Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <ShieldAlert size={20} color="var(--red-400)" /> Adversarial Attack &amp; Manipulation Sandbox
            </span>
            <span className="card-subtitle">
              Evaluating resilience against Problem 1 (False Data), Problem 3 (Fake Ratings / Ballot Stuffing), Sybil, Cartels, and Wash Trading
            </span>
          </div>
          <span className="badge badge-red">ATTACK INJECTOR ACTIVE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {attacks.map((att) => {
            const Icon = att.icon;
            const isSelected = state.activeAttack === att.id;
            return (
              <div
                key={att.id}
                onClick={() => onSelectAttack(att.id)}
                style={{
                  background: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '2px solid var(--red-400)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      padding: '0.4rem',
                      borderRadius: '8px',
                      color: isSelected ? 'var(--red-400)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                    {att.label}
                  </strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{att.summary}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Analysis: Vulnerable Baseline vs SG2.0 Defended */}
      <div className="panel-grid">
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--red-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={18} color="var(--red-400)" /> Vulnerable Baseline (No Defense)
            </span>
            <span className="badge badge-red">EXPLOITABLE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Without cryptographic smart-meter asset attestation, oracle verification, and ballot-stuffing rate-limiting:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Attacker Profit / Reputation Advantage</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'SYBIL'
                  ? '+34.0%'
                  : state.activeAttack === 'SELLER_CARTEL'
                  ? '+35.0%'
                  : state.activeAttack === 'WASH_TRADING'
                  ? '+28.0%'
                  : state.activeAttack === 'PHANTOM_ENERGY'
                  ? '+18.0% (Unchecked)'
                  : state.activeAttack === 'FALSE_DATA_ORACLE'
                  ? '+45.0% (Undelivered Energy Sold)'
                  : state.activeAttack === 'FAKE_RATING_BALLOT'
                  ? '+68.0% Artificial Trust'
                  : '0.0%'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Market Distortion Impact</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)', fontSize: '1.05rem' }}>
                {state.activeAttack === 'SYBIL'
                  ? '38.4% Market Share Captured by Puppets'
                  : state.activeAttack === 'SELLER_CARTEL'
                  ? 'Clearing Price Inflated by +35.0%'
                  : state.activeAttack === 'WASH_TRADING'
                  ? 'Fictitious Alpha Trust Inflated 3.8x'
                  : state.activeAttack === 'PHANTOM_ENERGY'
                  ? 'Severe Grid Imbalance & Consumer Blackouts'
                  : state.activeAttack === 'FALSE_DATA_ORACLE'
                  ? '60% Data Violation: 10 kWh Claimed, Only 4 kWh Delivered'
                  : state.activeAttack === 'FAKE_RATING_BALLOT'
                  ? '20 Fake Ratings Stuffed via A1-A4 Puppets'
                  : 'Normal Competitive Dispatch'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Defense Effectiveness Score</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'NONE' ? '100%' : '12.0% (Vulnerable)'}
              </div>
            </div>
          </div>
        </div>

        {/* SG2.0 Defended System */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--green-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={18} color="var(--green-400)" /> Proposed SG2.0 Defended System
            </span>
            <span className="badge badge-green">MITIGATED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Enforcing Smart-Meter DID verification, Oracle meter validation, Ballot-stuffing pruning, and Collateral Slashing:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Attacker Advantage (Defended)</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE'
                  ? rm.falseDataPenaltiesApplied > 0
                    ? '-15.0% (Collateral Slashed)'
                    : 'Oracle Capped to 4.0 kWh'
                  : state.activeAttack === 'FAKE_RATING_BALLOT'
                  ? `+${rm.reputationInflationPct}% (Suppressed from +68%)`
                  : state.attackMetrics.attackerProfitAdvantagePct > 0
                  ? `+${state.attackMetrics.attackerProfitAdvantagePct}%`
                  : `${state.attackMetrics.attackerProfitAdvantagePct}% (Net Slashing Penalty)`}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Active Countermeasure Applied</div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)', fontSize: '1.05rem' }}>
                {state.activeAttack === 'SYBIL'
                  ? 'Proof-of-Physical-Asset DID Meter Binding'
                  : state.activeAttack === 'SELLER_CARTEL'
                  ? 'SDR Reserve Pricing Ceiling Bound'
                  : state.activeAttack === 'WASH_TRADING'
                  ? 'Graph Cycle Detection & Log-Discounting'
                  : state.activeAttack === 'PHANTOM_ENERGY'
                  ? 'Automated Escrow Slashing & Bond Transfer'
                  : state.activeAttack === 'FALSE_DATA_ORACLE'
                  ? 'Smart Meter Oracle Attestation & Physical Capping'
                  : state.activeAttack === 'FAKE_RATING_BALLOT'
                  ? 'Graph Pattern Detection & 88% Vote Pruning'
                  : 'Truthful Double Auction Clearing'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Defense Effectiveness Score</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {state.activeAttack === 'FALSE_DATA_ORACLE'
                  ? state.fairnessPolicies.oracleVerificationEnabled ? '94.5% ✓' : '20.0% (Enable Oracle)'
                  : state.activeAttack === 'FAKE_RATING_BALLOT'
                  ? state.fairnessPolicies.antiBallotStuffingEnabled ? '96.2% ✓' : '22.0% (Enable Defense)'
                  : `${state.attackMetrics.defenseEffectivenessScore}% ✓`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defense Mechanism Policy Toggles */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Zap size={18} color="var(--cyan-400)" /> Algorithmic Defense Controls
          </span>
          <span className="badge badge-cyan">CONFIGURABLE COUNTERMEASURES</span>
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
              <span className="toggle-title">Smart Meter Oracle Verification (Problem 1)</span>
              <span className="toggle-desc">Cross-check claimed capacity vs physical meter readings before clearing</span>
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
                antiBallotStuffingEnabled: !state.fairnessPolicies.antiBallotStuffingEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Anti-Ballot Stuffing &amp; Fake Ratings (Problem 3)</span>
              <span className="toggle-desc">Rate-limit endorsements, detect puppet clusters, and discount artificial ratings</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.antiBallotStuffingEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          <div
            className="toggle-wrapper"
            onClick={() =>
              onUpdatePolicies({
                sybilProofOfAssetEnabled: !state.fairnessPolicies.sybilProofOfAssetEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Proof-of-Physical-Asset (Anti-Sybil)</span>
              <span className="toggle-desc">Requires cryptographic meter DID attestation on registration</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.sybilProofOfAssetEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          <div
            className="toggle-wrapper"
            onClick={() =>
              onUpdatePolicies({
                antiWashCycleDetectionEnabled: !state.fairnessPolicies.antiWashCycleDetectionEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Anti-Wash Cycle Graph Pruning</span>
              <span className="toggle-desc">Discounts pairwise reputation gains between reciprocal trading rings</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.antiWashCycleDetectionEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
