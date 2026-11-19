import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  KeyRound,
  Coins,
  Cpu,
  BadgeCheck,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { SimulationState, SystemFairnessPolicies } from '../core/types';

interface SybilAttackSolutionViewProps {
  state: SimulationState;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
}

export const SybilAttackSolutionView: React.FC<SybilAttackSolutionViewProps> = ({
  state,
  onUpdatePolicies,
}) => {
  const pipeline = state.fairnessPolicies.sybilDefensePipeline;
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([
    'System ready. Toggle the 5 defense pillars below to test Sybil resistance against puppets A1-A4.',
  ]);

  const updateSybilPillar = (pillar: keyof typeof pipeline, value: boolean) => {
    onUpdatePolicies({
      sybilDefensePipeline: {
        ...pipeline,
        [pillar]: value,
      },
    });
  };

  const enableAllPillars = () => {
    onUpdatePolicies({
      sybilProofOfAssetEnabled: true,
      antiBallotStuffingEnabled: true,
      sybilDefensePipeline: {
        didRegistrationEnabled: true,
        meterHardwareAuthEnabled: true,
        economicStakingRequired: true,
        stakeAmountPerIdentity: 150,
        proofOfPhysicalAssetEnabled: true,
        bayesianAntiBallotEnabled: true,
      },
    });
    setLogMessages((prev) => [
      `[${new Date().toLocaleTimeString()}] ✅ ALL 5 DEFENSE PILLARS ACTIVATED: Registration, Authentication, Staking, Sybil Resistance, Robust Reputation.`,
      ...prev.slice(0, 7),
    ]);
  };

  const disableAllPillars = () => {
    onUpdatePolicies({
      sybilProofOfAssetEnabled: false,
      antiBallotStuffingEnabled: false,
      sybilDefensePipeline: {
        didRegistrationEnabled: false,
        meterHardwareAuthEnabled: false,
        economicStakingRequired: false,
        stakeAmountPerIdentity: 150,
        proofOfPhysicalAssetEnabled: false,
        bayesianAntiBallotEnabled: false,
      },
    });
    setLogMessages((prev) => [
      `[${new Date().toLocaleTimeString()}] ⚠️ ALL DEFENSES DISABLED: System is now vulnerable to Sybil puppet flooding (A1-A4).`,
      ...prev.slice(0, 7),
    ]);
  };

  // Evaluate the 4 puppet accounts (A1, A2, A3, A4) status based on active pillars
  const puppets = ['A1', 'A2', 'A3', 'A4'].map((name) => {
    let blockedBy: string | null = null;
    let barrierPillar: number | null = null;
    let isBlocked = false;

    if (pipeline.didRegistrationEnabled) {
      isBlocked = true;
      barrierPillar = 1;
      blockedBy = 'Pillar 1 (Registration): Missing utility-accredited DID document';
    } else if (pipeline.meterHardwareAuthEnabled) {
      isBlocked = true;
      barrierPillar = 2;
      blockedBy = 'Pillar 2 (Authentication): Smart meter hardware ECDSA signature invalid';
    } else if (pipeline.economicStakingRequired) {
      isBlocked = true;
      barrierPillar = 3;
      blockedBy = 'Pillar 3 (Staking): $150 collateral stake requirement unpaid';
    } else if (pipeline.proofOfPhysicalAssetEnabled) {
      isBlocked = true;
      barrierPillar = 4;
      blockedBy = 'Pillar 4 (Sybil Resistance): Duplicate NMI physical meter conflict detected at Node 3';
    } else if (pipeline.bayesianAntiBallotEnabled) {
      isBlocked = false;
      barrierPillar = 5;
      blockedBy = 'Pillar 5 (Robust Reputation): 88% vote discount applied to circular ratings';
    }

    return {
      id: `PUPPET_${name}`,
      label: `Puppet ${name}`,
      isBlocked,
      barrierPillar,
      blockedBy,
      assignedStake: pipeline.economicStakingRequired ? 150 : 0,
      claimedEnergy: 2.0,
      ballotVoteWeight: pipeline.bayesianAntiBallotEnabled ? 0.12 : 1.0,
    };
  });

  const blockedCount = puppets.filter((p) => p.isBlocked).length;
  const anyPillarActive =
    pipeline.didRegistrationEnabled ||
    pipeline.meterHardwareAuthEnabled ||
    pipeline.economicStakingRequired ||
    pipeline.proofOfPhysicalAssetEnabled ||
    pipeline.bayesianAntiBallotEnabled;

  const identityTrustSecured =
    pipeline.didRegistrationEnabled &&
    pipeline.meterHardwareAuthEnabled &&
    (pipeline.economicStakingRequired || pipeline.proofOfPhysicalAssetEnabled);

  const reputationTrustSecured = pipeline.bayesianAntiBallotEnabled;

  const runAttackSimulation = () => {
    setSimulationStep((s) => s + 1);
    if (blockedCount === 4) {
      setLogMessages((prev) => [
        `[${new Date().toLocaleTimeString()}] 🛡️ Sybil Attack Intercepted: All 4 puppet identities (A1-A4) were rejected before entering the order book.`,
        `[${new Date().toLocaleTimeString()}] 📋 SmartContract:ParticipantRegistry: REJECT_SYBIL (No accredited DID / Duplicate Meter NMI)`,
        ...prev.slice(0, 6),
      ]);
    } else if (blockedCount > 0) {
      setLogMessages((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠️ Partial Mitigation: ${blockedCount}/4 puppets blocked. ${4 - blockedCount} puppet(s) penetrated the auction.`,
        ...prev.slice(0, 6),
      ]);
    } else {
      setLogMessages((prev) => [
        `[${new Date().toLocaleTimeString()}] 🚨 SYBIL BREACH: Attacker successfully spawned A1, A2, A3, A4. 20 fake votes cast (+68% reputation inflation).`,
        `[${new Date().toLocaleTimeString()}] 💸 Attacker gained 38.4% market share without financial stake or physical meter backing.`,
        ...prev.slice(0, 6),
      ]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Slide 08 Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--purple-400)' }}>
              <ShieldAlert size={20} /> Slide 08 — Problem 3: Sybil Attacks &amp; Reputation Manipulation (Complete Solution)
            </span>
            <span className="card-subtitle">
              &ldquo;Fake bids, votes and interactions inflate influence and reputation. One real participant &rarr; A1, A2, A3, A4&rdquo;
            </span>
          </div>
          <span className="badge badge-purple">SLIDE 08 / IDENTITY &amp; TRUST</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          In decentralized P2P energy trading, a strategic actor creates multiple virtual puppet accounts (<strong>A1, A2, A3, A4</strong>)
          to flood the market, cast fraudulent rating endorsements (ballot stuffing), and manipulate clearing prices.
          Solving this requires addressing both <strong>Identity Trust</strong> and <strong>Reputation Trust</strong> using the 5 core pillars.
        </p>

        {/* The Two Trust Dimensions from Slide 08 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div
            style={{
              background: identityTrustSecured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: identityTrustSecured ? '1px solid var(--green-500)' : '1px solid var(--red-500)',
              padding: '0.9rem',
              borderRadius: '10px',
            }}
          >
            <div style={{ color: identityTrustSecured ? 'var(--green-400)' : 'var(--red-400)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BadgeCheck size={18} /> 1. IDENTITY TRUST: &ldquo;Is the participant unique and real?&rdquo;
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <strong>Status:</strong> {identityTrustSecured ? 'SECURED ✅ (Verified via DID, Hardware Auth & Meter Staking)' : 'VULNERABLE ⚠️ (Virtual puppets can freely register)'}
            </p>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Pillars Required: registration &bull; authentication &bull; staking &bull; Sybil resistance
            </div>
          </div>

          <div
            style={{
              background: reputationTrustSecured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: reputationTrustSecured ? '1px solid var(--green-500)' : '1px solid var(--amber-500)',
              padding: '0.9rem',
              borderRadius: '10px',
            }}
          >
            <div style={{ color: reputationTrustSecured ? 'var(--green-400)' : 'var(--amber-400)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={18} /> 2. REPUTATION TRUST: &ldquo;Does the score reflect true behavior?&rdquo;
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <strong>Status:</strong> {reputationTrustSecured ? 'SECURED ✅ (Coordinated puppet ratings discounted by 88%)' : 'VULNERABLE ⚠️ (Ballot stuffing inflates score by +68%)'}
            </p>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Pillars Required: robust Bayesian reputation &bull; anti-ballot stuffing &bull; cycle pruning
            </div>
          </div>
        </div>
      </div>

      {/* Slide 08 Interactive Threat Architecture Diagram */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={18} color="var(--cyan-400)" /> Slide 08 Threat Topology: Real Participant &rarr; Puppets (A1&ndash;A4)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={runAttackSimulation} id="btn-run-sybil-sim">
              <Play size={14} /> Simulate Sybil Attack Attempt
            </button>
            <button className="btn btn-secondary" onClick={enableAllPillars} id="btn-enable-all-sybil">
              <ShieldCheck size={14} color="var(--green-400)" /> Enable All 5 Pillars
            </button>
            <button className="btn btn-danger" onClick={disableAllPillars} id="btn-disable-all-sybil">
              <RotateCcw size={14} /> Reset / Disable
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            overflowX: 'auto',
          }}
        >
          <svg viewBox="0 0 940 300" style={{ width: '100%', minWidth: '820px', height: '300px' }}>
            {/* Real Participant Box */}
            <rect x="30" y="105" width="220" height="90" rx="14" fill="rgba(15, 23, 42, 0.9)" stroke="var(--cyan-400)" strokeWidth="3" />
            <text x="140" y="135" fill="var(--cyan-400)" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">ONE REAL</text>
            <text x="140" y="158" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">PARTICIPANT</text>
            <text x="140" y="180" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Master Strategic Attacker</text>

            {/* Arrows from real participant to A1-A4 */}
            {[0, 1, 2, 3].map((i) => {
              const yTarget = 24 + i * 68;
              return (
                <line
                  key={i}
                  x1="250"
                  y1="150"
                  x2="390"
                  y2={yTarget + 24}
                  stroke="var(--red-400)"
                  strokeWidth="2.5"
                  markerEnd="url(#sybilArrowRed)"
                />
              );
            })}

            <defs>
              <marker id="sybilArrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
              </marker>
              <marker id="sybilArrowAmber" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
              </marker>
              <marker id="sybilArrowGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#34d399" />
              </marker>
            </defs>

            {/* Puppets A1-A4 */}
            {['A1', 'A2', 'A3', 'A4'].map((name, i) => {
              const yPos = 20 + i * 68;
              const puppetBlocked = puppets[i]?.isBlocked;
              return (
                <g key={name}>
                  <rect
                    x="390"
                    y={yPos}
                    width="140"
                    height="48"
                    rx="10"
                    fill={puppetBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)'}
                    stroke={puppetBlocked ? 'var(--red-500)' : 'var(--cyan-400)'}
                    strokeWidth="2.5"
                  />
                  <text x="460" y={yPos + 26} fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">{name}</text>
                  <text
                    x="460"
                    y={yPos + 40}
                    fill={puppetBlocked ? 'var(--red-400)' : 'var(--cyan-400)'}
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {puppetBlocked ? 'BLOCKED ✗' : 'ACTIVE IN AUCTION ✓'}
                  </text>
                </g>
              );
            })}

            {/* 5-Pillar Defense Filter Gate (Vertical Firewall) */}
            <rect
              x="570"
              y="15"
              width="100"
              height="270"
              rx="12"
              fill={blockedCount === 4 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
              stroke={blockedCount === 4 ? 'var(--green-500)' : 'var(--red-500)'}
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text x="620" y="40" fill={blockedCount === 4 ? 'var(--green-400)' : 'var(--red-400)'} fontSize="10" fontWeight="800" textAnchor="middle">
              5-PILLAR
            </text>
            <text x="620" y="55" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">
              DEFENSE
            </text>
            <text x="620" y="70" fill={blockedCount === 4 ? 'var(--green-400)' : 'var(--red-400)'} fontSize="10" fontWeight="700" textAnchor="middle">
              FIREWALL
            </text>

            <text x="620" y="110" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">1. DID</text>
            <text x="620" y="135" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">2. TPM Auth</text>
            <text x="620" y="160" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">3. Staking</text>
            <text x="620" y="185" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">4. NMI Proof</text>
            <text x="620" y="210" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">5. Beta Trust</text>

            <text x="620" y="260" fill={blockedCount === 4 ? 'var(--green-400)' : 'var(--amber-400)'} fontSize="11" fontWeight="800" textAnchor="middle">
              {blockedCount}/4 Cut
            </text>

            {/* Output to Market Ledger */}
            <rect x="710" y="75" width="200" height="150" rx="14" fill="rgba(15, 23, 42, 0.9)" stroke={blockedCount === 4 ? 'var(--green-400)' : 'var(--red-400)'} strokeWidth="2.5" />
            <text x="810" y="105" fill={blockedCount === 4 ? 'var(--green-400)' : 'var(--red-400)'} fontSize="11" fontWeight="800" textAnchor="middle">
              MARKET OUTCOME
            </text>
            <text x="810" y="132" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle">
              {blockedCount === 4 ? 'Competitive Truth' : 'Gamed Sybil Market'}
            </text>
            <text x="810" y="156" fill="var(--text-secondary)" fontSize="9.5" textAnchor="middle">
              {blockedCount === 4 ? 'Score: 0.42 (Truthful)' : 'Score: 0.94 (Gamed)'}
            </text>
            <text x="810" y="178" fill={blockedCount === 4 ? 'var(--green-400)' : 'var(--amber-400)'} fontSize="9.5" fontWeight="700" textAnchor="middle">
              {blockedCount === 4 ? '✓ All 4 Sybils Blocked' : '+68% Inflation (+38% Share)'}
            </text>
            <text x="810" y="200" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">
              {blockedCount === 4 ? 'Zero unbacked energy traded' : 'Honest prosumers displaced'}
            </text>
          </svg>
        </div>
      </div>

      {/* The 5 Pillars of the Solution (Slide 08) */}
      <div className="card" style={{ borderTop: '3px solid var(--green-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title">
              <ShieldCheck size={20} color="var(--green-400)" /> The 5-Pillar Sybil Solution: Slide 08 Implementation
            </span>
            <span className="card-subtitle">
              Slide 08: <strong>registration &bull; authentication &bull; staking &bull; Sybil resistance &bull; robust reputation</strong>
            </span>
          </div>
          <span className={`badge ${blockedCount === 4 ? 'badge-green' : 'badge-amber'}`}>
            {blockedCount === 4 ? '5/5 PILLARS ACTIVE' : `${blockedCount}/4 PUPPETS BLOCKED`}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Pillar 1: Registration */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.didRegistrationEnabled ? '4px solid var(--green-400)' : '4px solid var(--border)' }}
            onClick={() => updateSybilPillar('didRegistrationEnabled', !pipeline.didRegistrationEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BadgeCheck size={18} color="var(--cyan-400)" /> 1. Registration (DID Attestation)
              </span>
              <span className="toggle-desc">
                Enforces utility-accredited Decentralized Identifier (DID) credentials. Prevents generation of arbitrary virtual accounts.
              </span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.didRegistrationEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 2: Authentication */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.meterHardwareAuthEnabled ? '4px solid var(--green-400)' : '4px solid var(--border)' }}
            onClick={() => updateSybilPillar('meterHardwareAuthEnabled', !pipeline.meterHardwareAuthEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={18} color="var(--purple-400)" /> 2. Authentication (Hardware TPM)
              </span>
              <span className="toggle-desc">
                Challenge-response protocol signed via smart meter hardware private keys (ECDSA secp256k1). Virtual scripts fail challenge.
              </span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.meterHardwareAuthEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 3: Staking */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.economicStakingRequired ? '4px solid var(--green-400)' : '4px solid var(--border)' }}
            onClick={() => updateSybilPillar('economicStakingRequired', !pipeline.economicStakingRequired)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Coins size={18} color="var(--amber-400)" /> 3. Economic Staking Barrier
              </span>
              <span className="toggle-desc">
                Requires $150 financial collateral per identity. Spawning 4 puppets forces $750 capital lock, making attacks unprofitable.
              </span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.economicStakingRequired} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 4: Sybil Resistance */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.proofOfPhysicalAssetEnabled ? '4px solid var(--green-400)' : '4px solid var(--border)' }}
            onClick={() => updateSybilPillar('proofOfPhysicalAssetEnabled', !pipeline.proofOfPhysicalAssetEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={18} color="var(--green-400)" /> 4. Sybil Resistance (NMI Binding)
              </span>
              <span className="toggle-desc">
                Proof-of-Physical-Asset: strictly restricts 1 participant account to 1 unique physical National Meter Identifier (NMI).
              </span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.proofOfPhysicalAssetEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>

          {/* Pillar 5: Robust Reputation */}
          <div
            className="toggle-wrapper"
            style={{ borderLeft: pipeline.bayesianAntiBallotEnabled ? '4px solid var(--green-400)' : '4px solid var(--border)' }}
            onClick={() => updateSybilPillar('bayesianAntiBallotEnabled', !pipeline.bayesianAntiBallotEnabled)}
          >
            <div className="toggle-label">
              <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={18} color="var(--cyan-400)" /> 5. Robust Reputation (Anti-Ballot)
              </span>
              <span className="toggle-desc">
                Bayesian Beta/Dirichlet update rule applies logarithmic discounts to reciprocal puppet endorsements, crushing ballot stuffing.
              </span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={pipeline.bayesianAntiBallotEnabled} readOnly />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Live Puppet Infiltration & Defense Matrix */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <CheckCircle2 size={18} color="var(--green-400)" /> Puppet Account Real-Time Interception Matrix (A1 &rarr; A4)
          </span>
          <span className={`badge ${blockedCount === 4 ? 'badge-green' : 'badge-red'}`}>
            {blockedCount} / 4 PUPPETS QUARANTINED
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Puppet ID</th>
                <th>Master Attacker</th>
                <th>Grid Node</th>
                <th>Required Escrow Stake</th>
                <th>Endorsement Weight</th>
                <th>Interception Barrier</th>
                <th>Execution Outcome</th>
              </tr>
            </thead>
            <tbody>
              {puppets.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{p.id}</td>
                  <td>Master Prosumer #1</td>
                  <td>Bus 3 (Residential B1)</td>
                  <td style={{ color: p.assignedStake > 0 ? 'var(--amber-400)' : 'var(--text-muted)' }}>
                    ${p.assignedStake}
                  </td>
                  <td style={{ color: p.ballotVoteWeight < 1.0 ? 'var(--green-400)' : 'var(--red-400)' }}>
                    {(p.ballotVoteWeight * 100).toFixed(0)}%
                  </td>
                  <td style={{ fontSize: '0.78rem', color: p.isBlocked ? 'var(--green-400)' : 'var(--red-400)' }}>
                    {p.blockedBy || 'Passed without interception (Vulnerable)'}
                  </td>
                  <td>
                    {p.isBlocked ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} /> BLOCKED
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <XCircle size={12} /> INFILTRATING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Blockchain Log Inspector */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Cpu size={18} color="var(--purple-400)" /> Live Sybil Defense Telemetry &amp; Event Stream
          </span>
          <span className="badge badge-purple">SIMULATION STEP #{simulationStep}</span>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        >
          {logMessages.map((msg, i) => (
            <div key={i} style={{ color: msg.includes('✅') || msg.includes('🛡️') ? 'var(--green-400)' : msg.includes('🚨') ? 'var(--red-400)' : 'var(--text-secondary)' }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
