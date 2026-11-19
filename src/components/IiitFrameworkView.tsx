import React, { useState } from 'react';
import {
  Scale,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Cpu,
  Database,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Blocks,
  Users,
} from 'lucide-react';
import { IiitExperimentRunner } from '../core/iiitExperimentRunner';
import { IiitScenarioType, IiitEvaluationMetrics } from '../core/types';

export const IiitFrameworkView: React.FC = () => {
  const [expRunner] = useState(() => new IiitExperimentRunner());
  const [activeModule, setActiveModule] = useState<'OVERVIEW' | 'MODULE1' | 'MODULE2' | 'MODULE3' | 'MODULE4' | 'BENCHMARKS'>('OVERVIEW');

  // Module 1 Interactive Validation State
  const [m1Claimed, setM1Claimed] = useState<number>(10.0);
  const [m1Gen, setM1Gen] = useState<number>(8.0);
  const [m1Cons, setM1Cons] = useState<number>(4.0);
  const [m1Res, setM1Res] = useState<number>(0.0);

  // Module 2 Interactive Dynamic Pricing State
  const [m2Sdr, setM2Sdr] = useState<number>(0.45);
  const [m2Ask, setM2Ask] = useState<number>(0.12);
  const [m2Bid, setM2Bid] = useState<number>(0.26);
  const [m2Alpha, setM2Alpha] = useState<number>(1.0);
  const [m2Lambda, setM2Lambda] = useState<number>(0.5);

  // Module 3 EWMA Reputation State
  const [m3CurrentRep, setM3CurrentRep] = useState<number>(0.85);
  const [m3DeliveryFrac, setM3DeliveryFrac] = useState<number>(1.0);
  const [m3ReportAcc, setM3ReportAcc] = useState<number>(0.4);
  const [m3SettleSuccess, setM3SettleSuccess] = useState<boolean>(true);
  const [m3Beta, setM3Beta] = useState<number>(0.2);

  // Module 4 Smart Contract State Machine
  const [m4State, setM4State] = useState<'CREATED' | 'FUNDED' | 'DELIVERING' | 'SETTLED' | 'CANCELLED'>('CREATED');
  const [m4GasSpent, setM4GasSpent] = useState<number>(68000);

  // Benchmarks State (Slide 12 & 13)
  const [benchScale, setBenchScale] = useState<10 | 25 | 50>(25);
  const [benchScenario, setBenchScenario] = useState<IiitScenarioType>('SCENARIO_C_SUPPLY_SHORTAGE');
  const [benchResults, setBenchResults] = useState<{
    baseline: IiitEvaluationMetrics;
    proposed: IiitEvaluationMetrics;
    withoutRep: IiitEvaluationMetrics;
    allocationsBaseline: { id: string; demand: number; allocated: number; satisfaction: number }[];
    allocationsProposed: { id: string; demand: number; allocated: number; satisfaction: number }[];
  }>(() => {
    const comp = expRunner.runPlannedComparisons(25);
    return {
      baseline: comp.baseline,
      proposed: comp.proposed,
      withoutRep: comp.withoutRep,
      allocationsBaseline: comp.baselineAllocations,
      allocationsProposed: comp.proposedAllocations,
    };
  });

  const handleRunBenchmarks = () => {
    const comp = expRunner.runPlannedComparisons(benchScale);
    setBenchResults({
      baseline: comp.baseline,
      proposed: comp.proposed,
      withoutRep: comp.withoutRep,
      allocationsBaseline: comp.baselineAllocations,
      allocationsProposed: comp.proposedAllocations,
    });
  };

  // Module 1 calculation
  const m1VerifiedSurplus = Math.max(0, m1Gen - m1Cons - m1Res);
  const m1Excess = Math.max(0, m1Claimed - m1VerifiedSurplus);
  const m1IsRejected = m1Claimed > m1VerifiedSurplus * 1.05 && m1Excess > 0.01;

  // Module 2 calculation
  const pFit = 0.08;
  const pGrid = 0.32;
  const m2PRef = pFit + (pGrid - pFit) * Math.exp(-m2Alpha * Math.max(0, m2Sdr));
  const m2PMid = (m2Ask + m2Bid) / 2;
  const m2RawTrade = m2Lambda * m2PRef + (1 - m2Lambda) * m2PMid;
  const m2PTrade = Math.max(Math.min(m2Ask, m2Bid), Math.min(Math.max(m2Ask, m2Bid), m2RawTrade));

  // Module 3 calculation
  const m3R_it = 0.5 * m3DeliveryFrac + 0.3 * m3ReportAcc + 0.2 * (m3SettleSuccess ? 1.0 : 0.0);
  const m3NextRep = (1 - m3Beta) * m3CurrentRep + m3Beta * m3R_it;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Attribution Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                IIIT ALLAHABAD RESEARCH FRAMEWORK
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                HYBRID OFF-CHAIN / ON-CHAIN
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#fff' }}>
              Fair and Trustworthy Peer-to-Peer Energy Trading in Smart Grid 2.0
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.8rem 0', fontSize: '0.92rem', maxWidth: '850px' }}>
              A Fairness-Aware Hybrid Framework: Proposed Implementation Methodology combining verified-input assumptions, fairness-aware clearing, evidence-based reputation, and blockchain audit.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div>
                <strong style={{ color: 'var(--purple-400)' }}>Authors:</strong> Krish (IIT2024120) &bull; Chahat Kumar (IIT2024201) &bull; Kush Singhania (IIT2024199)
              </div>
              <div>
                <strong style={{ color: 'var(--cyan-400)' }}>Institution:</strong> Indian Institute of Information Technology, Allahabad
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PROSUMER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan-400)' }}>Solar + Surplus</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LOCAL MARKET</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple-400)' }}>Validation + Clearing</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CONSUMER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--yellow-400)' }}>Demand + Bid</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>BLOCKCHAIN</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-400)' }}>Audit + Settlement</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for PPT Modules */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'OVERVIEW', label: '10-Step Architecture (Slide 05 & 06)', icon: Layers },
            { id: 'MODULE1', label: 'Module 1: Surplus Validation (Slide 07)', icon: Database },
            { id: 'MODULE2', label: 'Module 2: Fair Matching & SDR Pricing (Slide 08 & 09)', icon: Scale },
            { id: 'MODULE3', label: 'Module 3: EWMA Reputation (Slide 10)', icon: Activity },
            { id: 'MODULE4', label: 'Module 4: Smart Contract State Machine (Slide 11)', icon: Blocks },
            { id: 'BENCHMARKS', label: 'Evaluation Lab: Slide 12 & 13 Benchmarks', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id as any)}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: active ? '1px solid var(--purple-400)' : '1px solid var(--border)',
                  background: active ? 'rgba(139, 92, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={active ? 'var(--purple-400)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: 10-Step Workflow & 4-Layer Architecture (Slide 05 & 06) */}
      {activeModule === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 4-Layer Architecture */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="var(--purple-400)" /> Slide 05: Hybrid Off-Chain / On-Chain Architecture
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>LAYER 1</span>
                <h4 style={{ margin: '0.25rem 0 0.5rem 0', color: 'var(--cyan-400)' }}>Participants &amp; Data</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Prosumers &bull; Consumers &bull; Synthetic meter simulator &bull; Energy production &amp; bid data generation.
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>LAYER 2</span>
                <h4 style={{ margin: '0.25rem 0 0.5rem 0', color: 'var(--purple-400)' }}>Off-Chain Market Engine</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Validation &rarr; Matching &rarr; Proportional Allocation &rarr; Dynamic Pricing &rarr; EWMA Reputation.
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span className="badge badge-green" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>LAYER 3</span>
                <h4 style={{ margin: '0.25rem 0 0.5rem 0', color: 'var(--green-400)' }}>Blockchain Ledger</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Participant registration &bull; Trade commitments &bull; Escrow state machine &bull; Immutable audit history.
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span className="badge badge-yellow" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>LAYER 4</span>
                <h4 style={{ margin: '0.25rem 0 0.5rem 0', color: 'var(--yellow-400)' }}>Application Interface</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Simulation configuration &bull; Order book &bull; Feeder map &bull; Real-time evaluation dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* 10-Step Energy Trading Workflow */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--cyan-400)" /> Slide 06: Proposed 10-Step Energy Trading Workflow
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
              {[
                { step: 1, title: 'Generate Profiles', desc: 'Synthetic prosumer & consumer load profiles' },
                { step: 2, title: 'Register Participants', desc: 'DID & smart contract registration' },
                { step: 3, title: 'Submit Offers / Bids', desc: 'Sealed bids with SHA-256 commitments' },
                { step: 4, title: 'Validate via Meter', desc: 'S_i,t check', reject: 'REJECT: Invalid claim' },
                { step: 5, title: 'Find Compatible Pairs', desc: 'Filter bid >= ask', reject: 'REJECT: Incompatible bid-ask' },
                { step: 6, title: 'Fair Allocation', desc: 'Proportional under scarcity' },
                { step: 7, title: 'Calculate Prices', desc: 'Dynamic SDR reference clamp' },
                { step: 8, title: 'Record & Settle', desc: 'Escrow lock & execution', reject: 'REJECT: Insufficient funds' },
                { step: 9, title: 'Update Reputation', desc: 'EWMA on verified events only' },
                { step: 10, title: 'Log Evaluation', desc: 'Jain index, utilization & surplus' },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--purple-400)' }}>STEP {s.step}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan-400)' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', color: '#fff' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{s.desc}</div>
                  {s.reject && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.68rem',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: 'var(--red-400)',
                        fontWeight: 700,
                      }}
                    >
                      {s.reject}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Module 1 — Energy Data Validation (Slide 07) */}
      {activeModule === 'MODULE1' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Formula & Policy Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--red-400)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} /> Slide 07: Module 1 — Energy Data Validation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Detects and rejects false energy availability claims before offers enter the market clearing pipeline.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                MATHEMATICAL FORMULATION:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--cyan-400)', marginBottom: '0.35rem' }}>
                S_i,t = max(0, G_i,t &minus; C_i,t &minus; R_i,t)
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--purple-400)' }}>
                Accepted Offer: A_i,t = min(O_i,t, S_i,t)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                Where <strong>G</strong> = trusted simulated generation &bull; <strong>C</strong> = consumption &bull; <strong>R</strong> = reserved energy &bull; <strong>O</strong> = claimed offer.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Claimed Offer (O_i,t): {m1Claimed.toFixed(1)} kWh</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={m1Claimed}
                  onChange={(e) => setM1Claimed(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Simulated Solar Generation (G_i,t): {m1Gen.toFixed(1)} kWh</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={m1Gen}
                  onChange={(e) => setM1Gen(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Local Household Consumption (C_i,t): {m1Cons.toFixed(1)} kWh</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={m1Cons}
                  onChange={(e) => setM1Cons(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Battery / Emergency Reserve (R_i,t): {m1Res.toFixed(1)} kWh</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={m1Res}
                  onChange={(e) => setM1Res(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Slide 07 Offer Verification Example Visualizer */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Offer Verification Example (Slide 07)</h4>

              {/* Bar Comparison SVG */}
              <div style={{ height: '220px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3rem', border: '1px solid var(--border)' }}>
                {/* Claimed Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--amber-400)' }}>{m1Claimed.toFixed(1)} kWh</div>
                  <div
                    style={{
                      width: '70px',
                      height: `${Math.min(160, (m1Claimed / 15) * 160)}px`,
                      background: 'linear-gradient(to top, rgba(217, 119, 6, 0.9), rgba(245, 158, 11, 0.9))',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.2s ease',
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Claimed (O)</div>
                </div>

                {/* Verified Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--cyan-400)' }}>{m1VerifiedSurplus.toFixed(1)} kWh</div>
                  <div
                    style={{
                      width: '70px',
                      height: `${Math.min(160, (m1VerifiedSurplus / 15) * 160)}px`,
                      background: 'linear-gradient(to top, rgba(6, 182, 212, 0.9), rgba(56, 189, 248, 0.9))',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.2s ease',
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Verified (S)</div>
                </div>
              </div>
            </div>

            {/* Validation Outcome Decision */}
            <div style={{ marginTop: '1.25rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: m1IsRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  border: m1IsRejected ? '1px solid var(--red-500)' : '1px solid var(--green-500)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: m1IsRejected ? 'var(--red-400)' : 'var(--green-400)' }}>
                    DECISION: {m1IsRejected ? 'REJECT' : m1Excess > 0 ? 'CLAMPED' : 'ACCEPT'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Excess Claim: {m1Excess.toFixed(1)} kWh
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {m1IsRejected
                    ? `Strict Policy: Claimed ${m1Claimed.toFixed(1)} kWh exceeds verified surplus (${m1VerifiedSurplus.toFixed(1)} kWh) by ${m1Excess.toFixed(1)} kWh beyond tolerance. Offer rejected completely.`
                    : `Verified surplus is sufficient (${m1VerifiedSurplus.toFixed(1)} kWh). Accepted offer: ${Math.min(m1Claimed, m1VerifiedSurplus).toFixed(1)} kWh.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Module 2 — Matching & Dynamic Pricing (Slide 08 & 09) */}
      {activeModule === 'MODULE2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Side-by-Side: Greedy Baseline vs Two-Stage Proportional */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Baseline */}
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--amber-400)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-yellow">BASELINE (SLIDE 08)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume-Oriented</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--amber-400)' }}>
                Greedy Price Priority
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                Highest bids matched first. Under scarce supply, wealthy consumers consume 100% of available energy, leaving vulnerable consumers with zero allocation.
              </p>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                sort_desc(buyer_bids)<br />
                for buyer in buyers: allocate min(buyer.demand, supply)
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--amber-400)', fontWeight: 700 }}>BENCHMARK OUTCOME:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem' }}>Jain's Fairness Index: 0.332 (Severely Unfair)</div>
              </div>
            </div>

            {/* Proposed */}
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--cyan-400)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-cyan">PROPOSED (SLIDE 08)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Equity &amp; Proportionality</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--cyan-400)' }}>
                Two-Stage Fairness-Aware Allocation
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                <strong>Stage A:</strong> Filter compatibility (bid &ge; ask).<br />
                <strong>Stage B:</strong> Proportional allocation under scarcity: <code>q_j = min(d_j, S &times; d_j / &Sigma;d_k)</code>.
              </p>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--cyan-400)' }}>
                while supply &gt; 0 and unmet demand exists:<br />
                &nbsp;&nbsp;share = supply * demand / total_demand<br />
                &nbsp;&nbsp;allocate min(share, demand, capacity)
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--cyan-400)', fontWeight: 700 }}>BENCHMARK OUTCOME:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem' }}>Jain's Fairness Index: 1.000 (Completely Equitable)</div>
              </div>
            </div>
          </div>

          {/* Dynamic Pricing Interactive Calculator (Slide 09) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--purple-400)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} /> Slide 09: Module 2 — Dynamic Pricing Calculator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Reference price <code>P_ref</code> derived from Supply-Demand Ratio (SDR), blended with midpoint <code>P_mid</code> and clamped strictly between <code>[ask, bid]</code>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>Supply-Demand Ratio (SDR):</span>
                    <strong style={{ color: 'var(--cyan-400)' }}>{m2Sdr.toFixed(2)} ({m2Sdr < 1.0 ? 'Scarcity' : 'Surplus'})</strong>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.5"
                    step="0.05"
                    value={m2Sdr}
                    onChange={(e) => setM2Sdr(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seller Ask Price: ${m2Ask.toFixed(3)}/kWh</label>
                    <input
                      type="range"
                      min="0.08"
                      max="0.30"
                      step="0.01"
                      value={m2Ask}
                      onChange={(e) => setM2Ask(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Buyer Bid Price: ${m2Bid.toFixed(3)}/kWh</label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.35"
                      step="0.01"
                      value={m2Bid}
                      onChange={(e) => setM2Bid(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sensitivity Alpha (&alpha;): {m2Alpha.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={m2Alpha}
                      onChange={(e) => setM2Alpha(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Blend Lambda (&lambda;): {m2Lambda.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={m2Lambda}
                      onChange={(e) => setM2Lambda(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Computed Values Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SDR MACRO REFERENCE (P_ref):</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--purple-400)' }}>${m2PRef.toFixed(4)} / kWh</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P_FiT ($0.08) + (P_grid - P_FiT) &times; exp(-&alpha; &times; SDR)</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MICRO MIDPOINT (P_mid):</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cyan-400)' }}>${m2PMid.toFixed(4)} / kWh</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Seller Ask + Buyer Bid) / 2</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FINAL CLAMPED TRADE PRICE (P_trade):</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green-400)' }}>${m2PTrade.toFixed(4)} / kWh</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--green-400)' }}>clamp(&lambda;P_ref + (1-&lambda;)P_mid, ask, bid)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Module 3 — EWMA Reputation (Slide 10) */}
      {activeModule === 'MODULE3' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--purple-400)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} /> Slide 10: Module 3 — Behavior-Based Reputation (EWMA)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Reputation is updated exclusively from verified events (reporting accuracy, energy delivery fraction, and escrow settlement success). No unverified subjective ratings.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--purple-400)', marginBottom: '0.3rem' }}>
                R_i,t+1 = (1 &minus; &beta;) &times; R_i,t + &beta; &times; r_i,t
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Performance score <code>r_i,t &in; [0, 1]</code> = 0.5 &times; (Delivery Fraction) + 0.3 &times; (Reporting Accuracy) + 0.2 &times; (Settlement Success)
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prior Reputation (R_i,t): {m3CurrentRep.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={m3CurrentRep}
                  onChange={(e) => setM3CurrentRep(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery Fraction (Delivered / Contracted): {(m3DeliveryFrac * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={m3DeliveryFrac}
                  onChange={(e) => setM3DeliveryFrac(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reporting Accuracy (Verified / Claimed): {(m3ReportAcc * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={m3ReportAcc}
                  onChange={(e) => setM3ReportAcc(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="settle-check"
                  checked={m3SettleSuccess}
                  onChange={(e) => setM3SettleSuccess(e.target.checked)}
                />
                <label htmlFor="settle-check" style={{ fontSize: '0.82rem', color: '#fff', cursor: 'pointer' }}>
                  Smart Contract Escrow Settled Successfully (No Default)
                </label>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EWMA Weight (&beta;): {m3Beta.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={m3Beta}
                  onChange={(e) => setM3Beta(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Reputation Responsiveness</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT EPOCH EVENT SCORE (r_i,t):</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cyan-400)' }}>{m3R_it.toFixed(3)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    0.5 &times; {m3DeliveryFrac.toFixed(2)} + 0.3 &times; {m3ReportAcc.toFixed(2)} + 0.2 &times; {m3SettleSuccess ? '1.0' : '0.0'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEW REPUTATION SCORE (R_i,t+1):</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: m3NextRep >= m3CurrentRep ? 'var(--green-400)' : 'var(--red-400)' }}>
                    {m3NextRep.toFixed(3)}
                    <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      ({m3NextRep >= m3CurrentRep ? '+' : ''}{(m3NextRep - m3CurrentRep).toFixed(3)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--purple-400)', fontWeight: 700 }}>FUTURE MARKET IMPACT:</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                Scores &ge; 0.50 gain priority matching; scores &lt; 0.35 trigger mandatory collateral scaling up to 150%. Repeated defaults invoke automated smart contract disqualification.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Module 4 — Blockchain Smart Contract State Machine (Slide 11) */}
      {activeModule === 'MODULE4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--green-400)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Blocks size={20} /> Slide 11: Module 4 — Smart Contract State Machine
              </h3>
              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                Total Gas Used: {m4GasSpent.toLocaleString()} gas
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Minimal state machine providing independent escrow, reentrancy guards, and immutable auditability: <code>registerParticipant() &bull; createTrade() &bull; fundTrade() &bull; confirmDelivery() &bull; settleTrade() &bull; cancelTrade()</code>.
            </p>

            {/* State Machine Flow Diagram */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', padding: '1rem 0' }}>
              {[
                { state: 'CREATED', label: '1. CREATED', gas: '+68k gas', desc: 'Trade initiated' },
                { state: 'FUNDED', label: '2. FUNDED', gas: '+36k gas', desc: 'Buyer deposit locked' },
                { state: 'DELIVERING', label: '3. DELIVERING', gas: '+42k gas', desc: 'Meter telemetry pulse' },
                { state: 'SETTLED', label: '4. SETTLED', gas: '+54k gas', desc: 'Funds transferred' },
              ].map((s, idx) => {
                const isActive = m4State === s.state;
                return (
                  <React.Fragment key={s.state}>
                    <div
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        background: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                        border: isActive ? '2px solid var(--green-400)' : '1px solid var(--border)',
                        padding: '1rem',
                        borderRadius: '10px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isActive ? 'var(--green-400)' : '#fff' }}>{s.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.desc}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--purple-400)', marginTop: '0.35rem', fontWeight: 600 }}>{s.gas}</div>
                    </div>
                    {idx < 3 && <ArrowRight size={18} color="var(--text-muted)" />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Interactive Triggers */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setM4State('CREATED');
                  setM4GasSpent(68000);
                }}
              >
                Reset to CREATED
              </button>
              <button
                className="btn btn-primary"
                disabled={m4State !== 'CREATED'}
                onClick={() => {
                  setM4State('FUNDED');
                  setM4GasSpent((g) => g + 36000);
                }}
              >
                fundTrade() &rarr; FUNDED
              </button>
              <button
                className="btn btn-primary"
                disabled={m4State !== 'FUNDED'}
                onClick={() => {
                  setM4State('DELIVERING');
                  setM4GasSpent((g) => g + 42000);
                }}
              >
                confirmDelivery() &rarr; DELIVERING
              </button>
              <button
                className="btn btn-primary"
                disabled={m4State !== 'DELIVERING'}
                onClick={() => {
                  setM4State('SETTLED');
                  setM4GasSpent((g) => g + 54000);
                }}
              >
                settleTrade() &rarr; SETTLED
              </button>
              <button
                className="btn btn-secondary"
                style={{ color: 'var(--red-400)', borderColor: 'var(--red-500)' }}
                disabled={m4State === 'SETTLED' || m4State === 'CANCELLED'}
                onClick={() => {
                  setM4State('CANCELLED');
                  setM4GasSpent((g) => g + 31000);
                }}
              >
                cancelTrade() &rarr; CANCELLED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: Evaluation Lab — Slide 12 & 13 Planned Comparisons */}
      {activeModule === 'BENCHMARKS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="var(--purple-400)" /> Slide 12 &amp; 13: Live Benchmark &amp; Threat Testing Lab
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Compare Baseline Greedy vs Proposed Two-Stage Proportional Allocation across N=10, 25, 50 and threat scenarios.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scale:</span>
                  {([10, 25, 50] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBenchScale(s)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: benchScale === s ? '1px solid var(--cyan-400)' : '1px solid var(--border)',
                        background: benchScale === s ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                        color: benchScale === s ? 'var(--cyan-400)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      N={s}
                    </button>
                  ))}
                </div>

                <button className="btn btn-primary" onClick={handleRunBenchmarks} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Play size={15} /> Run Benchmark Comparison
                </button>
              </div>
            </div>
          </div>

          {/* Slide 13 Table Comparison */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
              Planned Comparisons Matrix (Slide 13 Table) &bull; N={benchScale} Participants
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>EVALUATION METRIC</th>
                    <th style={{ padding: '0.75rem', color: 'var(--amber-400)' }}>(1) GREEDY BASELINE</th>
                    <th style={{ padding: '0.75rem', color: 'var(--cyan-400)' }}>(2) PROPOSED PROPORTIONAL</th>
                    <th style={{ padding: '0.75rem', color: 'var(--purple-400)' }}>(3) WITHOUT REPUTATION</th>
                    <th style={{ padding: '0.75rem' }}>HYPOTHESIS / PURPOSE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Jain's Fairness Index</td>
                    <td style={{ padding: '0.75rem', color: 'var(--amber-400)', fontWeight: 800 }}>
                      {benchResults.baseline.jainsFairnessIndex.toFixed(3)} (Low Equity)
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)', fontWeight: 800 }}>
                      {benchResults.proposed.jainsFairnessIndex.toFixed(3)} (High Equity) ✅
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--purple-400)' }}>
                      {benchResults.withoutRep.jainsFairnessIndex.toFixed(3)}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Equity of energy satisfaction across wealth tiers
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Total Energy Traded</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.baseline.totalEnergyTradedKwh} kWh</td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
                      {benchResults.proposed.totalEnergyTradedKwh} kWh
                    </td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.withoutRep.totalEnergyTradedKwh} kWh</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Efficiency &amp; market clearing throughput
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Energy Utilization Rate</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.baseline.energyUtilizationRate}%</td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)' }}>{benchResults.proposed.energyUtilizationRate}%</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.withoutRep.energyUtilizationRate}%</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Traded energy vs verified surplus
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Total Buyer Cost</td>
                    <td style={{ padding: '0.75rem' }}>${benchResults.baseline.totalBuyerCost.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)' }}>${benchResults.proposed.totalBuyerCost.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>${benchResults.withoutRep.totalBuyerCost.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Economic expenditure for consumers
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Smart Contract Gas Consumption</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.baseline.totalGasConsumption.toLocaleString()} gas</td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)' }}>
                      {benchResults.proposed.totalGasConsumption.toLocaleString()} gas
                    </td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.withoutRep.totalGasConsumption.toLocaleString()} gas</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      On-chain execution computational overhead
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Execution Runtime</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.baseline.executionTimeMs} ms</td>
                    <td style={{ padding: '0.75rem', color: 'var(--cyan-400)' }}>{benchResults.proposed.executionTimeMs} ms</td>
                    <td style={{ padding: '0.75rem' }}>{benchResults.withoutRep.executionTimeMs} ms</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Algorithmic scalability
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
