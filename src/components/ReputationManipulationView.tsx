import React from 'react';
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Vote,
} from 'lucide-react';
import { SimulationState, SystemFairnessPolicies } from '../core/types';

interface ReputationManipulationViewProps {
  state: SimulationState;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
}

export const ReputationManipulationView: React.FC<ReputationManipulationViewProps> = ({
  state,
  onUpdatePolicies,
}) => {
  const rm = state.reputationManipulationMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Problem Statement Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--purple-400)' }}>
              <Star size={20} /> Problem 3 — Sybil Attacks &amp; Reputation Manipulation (Fake Ratings &amp; Ballot Stuffing)
            </span>
            <span className="card-subtitle">
              Fake bids, votes, and reciprocal interactions inflate influence and reputation.
              One real participant creates puppet accounts (A1 &rarr; A4) to game trust scores.
            </span>
          </div>
          <span className="badge badge-purple">IDENTITY &amp; REPUTATION TRUST</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              IDENTITY TRUST
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Is the participant unique and real?</strong> Needed: registration, authentication, staking, Sybil resistance, and proof-of-asset physical meter binding.
            </p>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--amber-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              REPUTATION TRUST
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Does the score reflect true behavior?</strong> Needed: robust Bayesian reputation, anti-ballot stuffing, graph cycle analysis, and time-decay aging.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Diagram: One Real Participant -> Puppet Accounts */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={18} color="var(--red-400)" /> Sybil Puppet &amp; Ballot Stuffing Architecture
          </span>
          <span className="badge badge-red">ATTACK TOPOLOGY</span>
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
          <svg viewBox="0 0 920 270" style={{ width: '100%', minWidth: '780px', height: '270px' }}>
            {/* Real Participant Box */}
            <rect x="30" y="95" width="210" height="85" rx="12" fill="rgba(6, 182, 212, 0.18)" stroke="var(--cyan-400)" strokeWidth="2.5" />
            <text x="135" y="125" fill="var(--cyan-400)" fontSize="11" fontWeight="700" textAnchor="middle">ONE REAL</text>
            <text x="135" y="146" fill="#ffffff" fontSize="14" fontWeight="800" textAnchor="middle">PARTICIPANT</text>
            <text x="135" y="166" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">Master Strategic Attacker</text>

            {/* Arrows from real to puppets */}
            {[0, 1, 2, 3].map((i) => {
              const yTarget = 25 + i * 62;
              return (
                <line
                  key={i}
                  x1="240"
                  y1="137"
                  x2="380"
                  y2={yTarget + 22}
                  stroke="var(--red-400)"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowRed)"
                />
              );
            })}

            <defs>
              <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
              </marker>
              <marker id="arrowAmber" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
              </marker>
            </defs>

            {/* Puppet Accounts A1-A4 */}
            {['A1', 'A2', 'A3', 'A4'].map((label, i) => {
              const yPos = 20 + i * 62;
              return (
                <g key={label}>
                  <rect x="380" y={yPos} width="125" height="44" rx="8" fill="rgba(6, 182, 212, 0.12)" stroke="var(--cyan-500)" strokeWidth="2" />
                  <text x="442" y={yPos + 27} fill="#ffffff" fontSize="15" fontWeight="800" textAnchor="middle">{label}</text>
                </g>
              );
            })}

            {/* Rating arrows from puppets to target */}
            {[0, 1, 2, 3].map((i) => {
              const ySource = 42 + i * 62;
              return (
                <line
                  key={`rate-${i}`}
                  x1="505"
                  y1={ySource}
                  x2="630"
                  y2={ySource}
                  stroke="var(--amber-400)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                  markerEnd="url(#arrowAmber)"
                />
              );
            })}

            {/* Fake Rating Labels */}
            {[0, 1, 2, 3].map((i) => {
              const yPos = 35 + i * 62;
              return (
                <text key={`star-${i}`} x="568" y={yPos} fill="var(--amber-400)" fontSize="10" fontWeight="600" textAnchor="middle">
                  ★★★★★ FAKE VOTE
                </text>
              );
            })}

            {/* Target reputation box */}
            <rect x="630" y="70" width="250" height="135" rx="12" fill="rgba(239, 68, 68, 0.12)" stroke="var(--red-400)" strokeWidth="2" />
            <text x="755" y="98" fill="var(--red-400)" fontSize="11" fontWeight="700" textAnchor="middle">INFLATED REPUTATION TARGET</text>
            <text x="755" y="124" fill="#ffffff" fontSize="16" fontWeight="800" textAnchor="middle">Score: 0.94 (Gamed)</text>
            <text x="755" y="148" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Truthful physical score: ~0.42</text>
            <text x="755" y="172" fill="var(--amber-400)" fontSize="10" fontWeight="700" textAnchor="middle">+68.0% Artificial Inflation!</text>
            <text x="755" y="190" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Gains priority dispatch in double auction</text>
          </svg>
        </div>
      </div>

      {/* Comparative Analysis */}
      <div className="panel-grid">
        {/* Vulnerable Baseline */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--red-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={18} color="var(--red-400)" /> Vulnerable Baseline (Unchecked Ratings)
            </span>
            <span className="badge badge-red">EXPLOITABLE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Without behavioral rate-limiting and ballot stuffing defenses, Sybil puppets easily collude to inflate reputation:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Fake Ratings Injected</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'FAKE_RATING_BALLOT' ? '20 fake ratings (4 puppets &times; 5 votes)' : '0'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Ballot Stuffing Volume</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)', fontSize: '1.05rem' }}>
                {state.activeAttack === 'FAKE_RATING_BALLOT' ? '20 fraudulent endorsements' : 'No Ballot Stuffing'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Reputation Inflation Impact</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                {state.activeAttack === 'FAKE_RATING_BALLOT' ? '+68.0% artificial trust inflation' : '0%'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Market Disruption</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>
                Attacker captures priority matching slots and displaces honest prosumers.
              </div>
            </div>
          </div>
        </div>

        {/* Defended System */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--green-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={18} color="var(--green-400)" /> SG2.0 Anti-Manipulation Defenses
            </span>
            <span className="badge badge-green">MITIGATED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Rate-limiting, graph cycle pruning, behavioral analysis, and proof-of-asset meter verification:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Fake Ratings Blocked</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {rm.defenseBlockedFakeRatings > 0
                  ? `${rm.defenseBlockedFakeRatings} / 20 fake ratings blocked (88%)`
                  : '88% detection & rejection rate'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Ballot Stuffing Suppressed</div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)', fontSize: '1.05rem' }}>
                {rm.defenseBlockedBallotStuffs > 0
                  ? `${rm.defenseBlockedBallotStuffs} puppet clusters quarantined`
                  : 'Graph cycle detection identifies coordinated voting'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Reputation Inflation (Defended)</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {rm.reputationInflationPct > 0 && rm.reputationInflationPct <= 5
                  ? `+${rm.reputationInflationPct}% (down from +68%)`
                  : '+2.5% residual inflation (96% mitigation) ✓'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Multi-Layer Countermeasures</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                DID Binding + Graph Cycle Pruning + Beta Time-Decay ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defense Controls */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Zap size={18} color="var(--cyan-400)" /> Anti-Reputation Manipulation Controls
          </span>
          <span className="badge badge-cyan">CONFIGURABLE DEFENSES</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div
            className="toggle-wrapper"
            onClick={() =>
              onUpdatePolicies({
                antiBallotStuffingEnabled: !state.fairnessPolicies.antiBallotStuffingEnabled,
              })
            }
          >
            <div className="toggle-label">
              <span className="toggle-title">Anti-Ballot Stuffing &amp; Fake Rating Defense</span>
              <span className="toggle-desc">Rate-limit ratings, detect puppet clusters, and discount coordinated voting</span>
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
              <span className="toggle-title">Proof-of-Physical-Asset DID Binding</span>
              <span className="toggle-desc">Each identity must bind cryptographically to a unique smart meter</span>
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
              <span className="toggle-title">Graph Cycle Detection (Reciprocal Discount)</span>
              <span className="toggle-desc">Logarithmically diminishes reputation gains between reciprocal trading pairs</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={state.fairnessPolicies.antiWashCycleDetectionEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      {state.activeAttack === 'FAKE_RATING_BALLOT' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={18} color="var(--green-400)" /> Live Reputation Manipulation Telemetry
            </span>
            <span className="badge badge-green">EPOCH {state.epoch}</span>
          </div>

          <div className="header-stats-row">
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--red-400)' }}>
              <div className="stat-chip-label">
                <XCircle size={12} /> Fake Ratings Injected
              </div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>{rm.fakeRatingInjectionCount}</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--amber-400)' }}>
              <div className="stat-chip-label">
                <Vote size={12} /> Ballot Stuffs
              </div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)' }}>{rm.ballotStuffingVoteCount}</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--purple-400)' }}>
              <div className="stat-chip-label">Rep. Inflation</div>
              <div className="stat-chip-value" style={{ color: 'var(--purple-400)' }}>+{rm.reputationInflationPct}%</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--green-400)' }}>
              <div className="stat-chip-label">
                <ShieldCheck size={12} /> Blocked Ratings
              </div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>{rm.defenseBlockedFakeRatings}</div>
            </div>
            <div className="stat-chip" style={{ borderLeft: '3px solid var(--cyan-400)' }}>
              <div className="stat-chip-label">
                <UserX size={12} /> Blocked Puppets
              </div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)' }}>{rm.defenseBlockedBallotStuffs}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
