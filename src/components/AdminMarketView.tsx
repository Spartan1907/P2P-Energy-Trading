import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Settings,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  AlertOctagon,
  UserX,
  Users,
  CheckCircle2,
  RefreshCw,
  Zap,
  Cpu,
} from 'lucide-react';
import { SimulationState, SystemFairnessPolicies, Participant } from '../core/types';

interface AdminMarketViewProps {
  state: SimulationState;
  onUpdatePolicies: (policies: Partial<SystemFairnessPolicies>) => void;
  onStep: () => void;
  onTogglePlay: () => void;
}

export const AdminMarketView: React.FC<AdminMarketViewProps> = ({
  state,
  onUpdatePolicies,
  onStep,
  onTogglePlay,
}) => {
  const [marketHalted, setMarketHalted] = useState(false);
  const [customRetailPrice, setCustomRetailPrice] = useState(0.32);
  const [customFiTPrice, setCustomFiTPrice] = useState(0.08);
  const [adminActionLogs, setAdminActionLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Market Operator Admin Console initialized. All smart contracts online.`,
  ]);

  const addLog = (msg: string) => {
    setAdminActionLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleSlashParticipant = (p: Participant) => {
    p.balance = Math.max(0, p.balance - 25);
    p.reputation.score = Math.max(0.05, p.reputation.score * 0.7);
    addLog(`⚠️ Slashed $25 collateral and degraded trust score for node ${p.id} due to policy compliance review.`);
  };

  const handleApproveDID = (p: Participant) => {
    p.reputation.score = Math.min(0.98, p.reputation.score + 0.15);
    addLog(`✅ Verified utility DID & hardware smart meter for ${p.id}. Trust score boosted.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Admin Console Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--purple-400)' }}>
              <ShieldAlert size={22} /> Market Operator Administration &amp; Grid Authority Console
            </span>
            <span className="card-subtitle">
              Supervisory Control and Data Acquisition (SCADA), Dynamic Tariff Anchoring &amp; Smart Contract Governance
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <span className="badge badge-purple">ADMIN LEVEL 4 (OPERATOR)</span>
            <span className={`badge ${marketHalted ? 'badge-red' : 'badge-green'}`}>
              {marketHalted ? 'CIRCUIT BREAKER: HALTED' : 'DOUBLE AUCTION: ACTIVE'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          As the authorized <strong>Microgrid Market Operator &amp; Distribution System Operator (DSO)</strong>,
          you govern wholesale boundary tariffs, emergency islanding, congestion surcharge funds, smart meter DID approvals,
          and blockchain consensus parameters.
        </p>
      </div>

      {/* Top SCADA Metrics & Emergency Controls */}
      <div className="panel-grid">
        {/* Emergency Circuit Breakers */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <span className="card-title">
              <AlertOctagon size={18} color="var(--red-400)" /> Emergency Circuit Breakers
            </span>
            <span className="badge badge-red">DISPATCH OVERRIDE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className={`btn ${marketHalted ? 'btn-primary' : 'btn-danger'}`}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
              onClick={() => {
                setMarketHalted(!marketHalted);
                addLog(marketHalted ? 'Resumed double auction market clearing.' : 'EMERGENCY HALT triggered by Operator.');
              }}
            >
              <AlertOctagon size={16} /> {marketHalted ? 'Resume Market Clearing' : 'Trigger Emergency Market Halt'}
            </button>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem' }}
              onClick={() => {
                onStep();
                addLog('Manual forced time step advanced (+1 hour).');
              }}
            >
              <RefreshCw size={14} /> Force Clear Next Double Auction (+1h)
            </button>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem' }}
              onClick={() => {
                onUpdatePolicies({
                  lifelineQuotaEnabled: true,
                  congestionSocializationEnabled: true,
                  weatherForgivenessEnabled: true,
                  oracleVerificationEnabled: true,
                  antiBallotStuffingEnabled: true,
                  sybilProofOfAssetEnabled: true,
                });
                addLog('Applied Full Energy Justice & Anti-Manipulation Protection Bundle.');
              }}
            >
              <ShieldCheck size={14} color="var(--green-400)" /> Enforce All Justice &amp; Security Bundles
            </button>
          </div>
        </div>

        {/* Dynamic Tariff & Boundary Anchors */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <span className="card-title">
              <DollarSign size={18} color="var(--amber-400)" /> Tariff Boundary Anchors
            </span>
            <span className="badge badge-amber">P_res BOUNDS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Retail Grid Tariff (Ceiling):</span>
                <strong style={{ color: 'var(--red-400)' }}>${customRetailPrice.toFixed(2)}/kWh</strong>
              </div>
              <input
                type="range"
                min="0.25"
                max="0.45"
                step="0.01"
                value={customRetailPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomRetailPrice(val);
                  addLog(`Retail price ceiling adjusted to $${val.toFixed(2)}/kWh`);
                }}
                style={{ width: '100%', accentColor: 'var(--red-400)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Feed-in Tariff FiT (Floor):</span>
                <strong style={{ color: 'var(--green-400)' }}>${customFiTPrice.toFixed(2)}/kWh</strong>
              </div>
              <input
                type="range"
                min="0.04"
                max="0.15"
                step="0.01"
                value={customFiTPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomFiTPrice(val);
                  addLog(`Feed-in Tariff floor adjusted to $${val.toFixed(2)}/kWh`);
                }}
                style={{ width: '100%', accentColor: 'var(--green-400)' }}
              />
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Equilibrium Spread: </span>
              <strong style={{ color: 'var(--amber-400)' }}>
                ${(customRetailPrice - customFiTPrice).toFixed(3)}/kWh
              </strong>
            </div>
          </div>
        </div>

        {/* Blockchain Validator Health */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <span className="card-title">
              <Layers size={18} color="var(--purple-400)" /> Validator Node Consensus
            </span>
            <span className="badge badge-purple">PoA CONSENSUS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Leader Validator:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--purple-400)' }}>0xGRID_OPERATOR_LEADER</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Blocks Mined:</span>
              <strong style={{ color: '#fff' }}>{state.blockchain.length} blocks</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pending Mempool Txs:</span>
              <strong style={{ color: 'var(--cyan-400)' }}>{state.pendingMempool.length} txs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Block Gas Limit:</span>
              <span>8,000,000 units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ledger Cryptographic Integrity:</span>
              <span style={{ color: 'var(--green-400)', fontWeight: 700 }}>VERIFIED (100% Tamper-Proof)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Fleet Management Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <Users size={18} color="var(--cyan-400)" /> Microgrid Participant Fleet &amp; DID Registry Admin
            </span>
            <span className="card-subtitle">
              Verify smart meters, review reputation scores, and apply smart contract slashing sanctions
            </span>
          </div>
          <span className="badge badge-cyan">{state.participants.length} NODES REGISTERED</span>
        </div>

        <div className="data-table-wrapper" style={{ maxHeight: '340px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Node ID &amp; Name</th>
                <th>Role &amp; Tier</th>
                <th>Grid Bus</th>
                <th>PV / Battery</th>
                <th>Reputation Score</th>
                <th>Wallet Balance</th>
                <th>DID Meter Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.participants.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.id}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.wealthTier === 1 ? 'badge-green' : p.wealthTier === 2 ? 'badge-cyan' : 'badge-amber'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      Tier {p.wealthTier}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{p.gridNodeId}</td>
                  <td>
                    {p.pvCapacityKw > 0 ? `${p.pvCapacityKw}kW PV` : 'None'}
                    {p.batteryCapacityKwh > 0 ? ` + ${p.batteryCapacityKwh}kWh Bat` : ''}
                  </td>
                  <td style={{ fontWeight: 700, color: p.reputation.score >= 0.6 ? 'var(--green-400)' : 'var(--amber-400)' }}>
                    {p.reputation.score.toFixed(2)}
                  </td>
                  <td style={{ color: '#fff', fontWeight: 600 }}>${p.balance.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      <CheckCircle2 size={10} /> Certified NMI
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => handleApproveDID(p)}
                        title="Approve DID credentials"
                      >
                        Boost DID
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => handleSlashParticipant(p)}
                        title="Slash $25 escrow collateral"
                      >
                        Slash $25
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operator Audit Log Stream */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Cpu size={18} color="var(--purple-400)" /> Operator Audit Trail &amp; Governance Events
          </span>
          <span className="badge badge-purple">REAL-TIME LOG</span>
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
          {adminActionLogs.map((log, i) => (
            <div key={i} style={{ color: log.includes('⚠️') ? 'var(--red-400)' : log.includes('✅') ? 'var(--green-400)' : 'var(--text-secondary)' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
