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
  KeyRound,
  Coins,
  Cpu,
  BadgeCheck,
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
  const sybilStatus = state.sybilDefenseStatus;
  const pipeline = state.fairnessPolicies.sybilDefensePipeline;

  const updateSybilPillar = (pillar: keyof typeof pipeline, value: boolean) => {
    onUpdatePolicies({
      sybilDefensePipeline: {
        ...pipeline,
        [pillar]: value,
      },
    });
  };

  // Evaluate the 4 puppet accounts (A1, A2, A3, A4) status based on active pillars
  const puppets = ['A1', 'A2', 'A3', 'A4'].map((name, idx) => {
    let blockedBy: string | null = null;
    let statusText = 'Infiltrated & Bidding';
    let isBlocked = false;

    if (pipeline.didRegistrationEnabled) {
      isBlocked = true;
      blockedBy = 'Pillar 1: Registration (No DID Document)';
      statusText = 'Registration Rejected';
    } else if (pipeline.meterHardwareAuthEnabled) {
      isBlocked = true;
      blockedBy = 'Pillar 2: Authentication (No Hardware Meter Key)';
      statusText = 'Auth Failed';
    } else if (pipeline.economicStakingRequired) {
      isBlocked = true;
      blockedBy = 'Pillar 3: Staking (Cost Barrier $150 Exceeded)';
      statusText = 'Stake Unfunded';
    } else if (pipeline.proofOfPhysicalAssetEnabled) {
      isBlocked = true;
      blockedBy = 'Pillar 4: Sybil Resistance (Duplicate Meter NMI at Node 3)';
      statusText = 'Duplicate NMI Flagged';
    } else if (pipeline.bayesianAntiBallotEnabled) {
      isBlocked = false;
      blockedBy = 'Pillar 5: Robust Reputation (Votes Discounted by 88%)';
      statusText = 'Reputation Quarantined';
    }

    return {
      id: `PUPPET_${name}`,
      label: `Puppet Account ${name}`,
      isBlocked,
      blockedBy,
      statusText,
      assignedStake: pipeline.economicStakingRequired ? 150 : 0,
      claimedEnergy: 2.0,
      ballotVoteWeight: pipeline.bayesianAntiBallotEnabled ? 0.12 : 1.0,
    };
  });

  const allPuppetsBlocked = puppets.every((p) => p.isBlocked);
  const totalStakingCost = puppets.reduce((sum, p) => sum + p.assignedStake, 0) + (pipeline.economicStakingRequired ? 150 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Problem Statement Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--purple-400)' }}>
              <Star size={20} /> Problem 3 — Sybil Attacks &amp; Reputation Manipulation
            </span>
            <span className="card-subtitle">
              Fake bids, votes and interactions inflate influence and reputation.
              One real participant creates puppet accounts (A1 &rarr; A4) to game the market.
            </span>
          </div>
          <span className="badge badge-purple">SLIDE 08 / IDENTITY &amp; REPUTATION TRUST</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BadgeCheck size={16} /> IDENTITY TRUST
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Is the participant unique and real?</strong>
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Requires: registration &bull; authentication &bull; economic staking &bull; Sybil resistance
            </div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--amber-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} /> REPUTATION TRUST
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <strong>Does the score reflect true behavior?</strong>
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Requires: robust reputation &bull; anti-ballot stuffing &bull; graph cycle pruning &bull; aging decay
            </div>
          </div>
        </div>
      </div>

      {/* Slide Diagram Architecture */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={18} color="var(--red-400)" /> Slide 08 Architecture: One Real Participant &rarr; Puppets (A1&ndash;A4)
          </span>
          <span className="badge badge-red">THREAT TOPOLOGY</span>
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
              const puppetBlocked = puppets[i]?.isBlocked;
              return (
                <g key={label}>
                  <rect
                    x="380"
                    y={yPos}
                    width="125"
                    height="44"
                    rx="8"
                    fill={puppetBlocked ? 'rgba(239, 68, 68, 0.18)' : 'rgba(6, 182, 212, 0.12)'}
                    stroke={puppetBlocked ? 'var(--red-400)' : 'var(--cyan-500)'}
                    strokeWidth="2"
                  />
                  <text x="442" y={yPos + 22} fill="#ffffff" fontSize="14" fontWeight="800" textAnchor="middle">{label}</text>
                  <text
                    x="442"
                    y={yPos + 36}
                    fill={puppetBlocked ? 'var(--red-400)' : 'var(--cyan-400)'}
                    fontSize="8.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {puppetBlocked ? 'BLOCKED ✗' : 'ACTIVE ✓'}
                  </text>
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
                  ★★★★★ FAKE
                </text>
              );
            })}

            {/* Target reputation box */}
            <rect x="630" y="70" width="250" height="135" rx="12" fill="rgba(239, 68, 68, 0.12)" stroke="var(--red-400)" strokeWidth="2" />
            <text x="755" y="98" fill="var(--red-400)" fontSize="11" fontWeight="700" textAnchor="middle">INFLATED REPUTATION TARGET</text>
            <text x="755" y="124" fill="#ffffff" fontSize="16" fontWeight="800" textAnchor="middle">
              {allPuppetsBlocked ? 'Score: 0.42 (Truthful)' : 'Score: 0.94 (Gamed)'}
            </text>
            <text x="755" y="148" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {allPuppetsBlocked ? 'All 4 puppet endorsements neutralized' : 'True physical score: ~0.42'}
            </text>
            <text
              x="755"
              y="172"
              fill={allPuppetsBlocked ? 'var(--green-400)' : 'var(--amber-400)'}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
            >
              {allPuppetsBlocked ? '✓ Manipulation Defeated' : '+68.0% Artificial Inflation!'}
            </text>
            <text x="755" y="190" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
              {allPuppetsBlocked ? 'Competitive double auction restored' : 'Gains priority dispatch in auction'}
            </text>
          </svg>
        </div>
      </div>

      {/* The 5-Pillar Sybil Defense Pipeline */}
      <div className="card" style={{ borderTop: '3px solid var(--green-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title">
              <ShieldCheck size={20} color="var(--green-400)" /> The 5-Pillar Sybil Defense Solution Pipeline
            </span>
            <span className="card-subtitle">
              Exact countermeasures specified in Slide 08: <strong>registration • authentication • staking • Sybil resistance • robust reputation</strong>
            </span>
          </div>
          <span className={`badge ${allPuppetsBlocked ? 'badge-green' : 'badge-amber'}`}>
            {allPuppetsBlocked ? 'ALL 4 PUPPETS NEUTRALIZED' : 'PUPPETS INFILTRATING'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          {/* Pillar 1: Registration */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.didRegistrationEnabled ? '3px solid var(--green-400)' : '3px solid var(--border)' }}
            onClick={() => updateSybilPillar('didRegistrationEnabled', !pipeline.didRegistrationEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BadgeCheck size={16} color="var(--cyan-400)" /> 1. Registration (DID)
              </span>
              <span className="toggle-desc">Verifiable Decentralized ID document check prevents arbitrary virtual accounts</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.didRegistrationEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 2: Authentication */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.meterHardwareAuthEnabled ? '3px solid var(--green-400)' : '3px solid var(--border)' }}
            onClick={() => updateSybilPillar('meterHardwareAuthEnabled', !pipeline.meterHardwareAuthEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={16} color="var(--purple-400)" /> 2. Authentication
              </span>
              <span className="toggle-desc">Hardware TPM challenge-response requires physical smart meter private keys</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.meterHardwareAuthEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 3: Staking */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.economicStakingRequired ? '3px solid var(--green-400)' : '3px solid var(--border)' }}
            onClick={() => updateSybilPillar('economicStakingRequired', !pipeline.economicStakingRequired)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Coins size={16} color="var(--amber-400)" /> 3. Economic Staking
              </span>
              <span className="toggle-desc">Requires $150 bond per identity ($750 total for 4 puppets + master)</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.economicStakingRequired} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 4: Sybil Resistance */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.proofOfPhysicalAssetEnabled ? '3px solid var(--green-400)' : '3px solid var(--border)' }}
            onClick={() => updateSybilPillar('proofOfPhysicalAssetEnabled', !pipeline.proofOfPhysicalAssetEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} color="var(--green-400)" /> 4. Sybil Resistance
              </span>
              <span className="toggle-desc">Proof-of-Physical-Asset: strictly binds 1 identity per physical NMI meter</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.proofOfPhysicalAssetEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 5: Robust Reputation */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.bayesianAntiBallotEnabled ? '3px solid var(--green-400)' : '3px solid var(--border)' }}
            onClick={() => updateSybilPillar('bayesianAntiBallotEnabled', !pipeline.bayesianAntiBallotEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} color="var(--cyan-400)" /> 5. Robust Reputation
              </span>
              <span className="toggle-desc">Bayesian alpha/beta updates discount reciprocal rating rings by 88%</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.bayesianAntiBallotEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Live Puppet Account Inspection Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <UserX size={18} color="var(--amber-400)" /> Puppet Account Defense Verification Matrix (A1 &rarr; A4)
          </span>
          <span className="badge badge-amber">{puppets.filter((p) => p.isBlocked).length} / 4 PUPPETS QUARANTINED</span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Puppet ID</th>
                <th>Target Attacker</th>
                <th>Required Stake ($)</th>
                <th>Vote Weight</th>
                <th>Defense Layer Interception</th>
                <th>Live Status</th>
              </tr>
            </thead>
            <tbody>
              {puppets.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.id}</td>
                  <td>Master Prosumer #1</td>
                  <td style={{ color: p.assignedStake > 0 ? 'var(--amber-400)' : 'var(--text-muted)' }}>
                    ${p.assignedStake}
                  </td>
                  <td style={{ color: p.ballotVoteWeight < 1.0 ? 'var(--green-400)' : 'var(--red-400)' }}>
                    {(p.ballotVoteWeight * 100).toFixed(0)}% weight
                  </td>
                  <td style={{ fontSize: '0.78rem', color: p.isBlocked ? 'var(--green-400)' : 'var(--red-400)' }}>
                    {p.blockedBy || 'Passed without interception'}
                  </td>
                  <td>
                    {p.isBlocked ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} /> Blocked
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <XCircle size={12} /> Infiltrating
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Evaluation */}
      <div className="panel-grid">
        {/* Vulnerable Baseline */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--red-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={18} color="var(--red-400)" /> Defenseless Baseline (No 5-Pillar Defense)
            </span>
            <span className="badge badge-red">EXPLOITABLE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Without registration DID, meter hardware auth, staking, and Sybil resistance:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Cost to Attacker to Spawn Puppets</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>$0.00 (Free Puppet Generation)</div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Market Share Captured by Puppets</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)', fontSize: '1.05rem' }}>
                38.4% of total market orders captured
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Reputation Inflation</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>+68.0% Artificial Trust</div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Identity Trust Guaranteed?</div>
              <div className="stat-chip-value" style={{ color: 'var(--red-400)' }}>NO ✗ (Identities are arbitrary)</div>
            </div>
          </div>
        </div>

        {/* Defended System */}
        <div className="card" style={{ gridColumn: 'span 6', borderTop: '3px solid var(--green-500)' }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={18} color="var(--green-400)" /> Proposed SG2.0 5-Pillar Defended System
            </span>
            <span className="badge badge-green">MITIGATED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Enforcing DID credentials, meter authentication, staking capital barrier, and NMI binding:
            </p>

            <div className="stat-chip">
              <div className="stat-chip-label">Attacker Economic Barrier Imposed</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                ${totalStakingCost} Collateral Locked in Escrow
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Sybil Puppet Capture Rate</div>
              <div className="stat-chip-value" style={{ color: 'var(--cyan-400)', fontSize: '1.05rem' }}>
                {allPuppetsBlocked ? '0.0% (All 4 Puppets Blocked) ✓' : `${((4 - puppets.filter((p) => p.isBlocked).length) / 4 * 38.4).toFixed(1)}%`}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Residual Reputation Gain</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>
                {pipeline.bayesianAntiBallotEnabled ? '+2.5% (96% Suppression) ✓' : '+68.0%'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Identity &amp; Reputation Trust Guaranteed?</div>
              <div className="stat-chip-value" style={{ color: 'var(--green-400)' }}>YES ✓ (Cryptographically &amp; Physically Bound)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
