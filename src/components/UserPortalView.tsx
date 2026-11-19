import React, { useState } from 'react';
import {
  User,
  Sun,
  Battery,
  Zap,
  TrendingUp,
  DollarSign,
  Shield,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { SimulationState, Participant } from '../core/types';

interface UserPortalViewProps {
  state: SimulationState;
  activeUserId?: string;
  onSelectUser?: (userId: string) => void;
  onSubmitOrder?: (params: {
    participantId: string;
    type: 'BUY' | 'SELL';
    energyKwh: number;
    pricePerKwh: number;
    gridNodeId?: string;
  }) => { success: boolean; orderId: string; message: string; txHash?: string };
}

export const UserPortalView: React.FC<UserPortalViewProps> = ({
  state,
  activeUserId = 'node_user_3',
  onSelectUser,
  onSubmitOrder,
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>(activeUserId);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('SELL');
  const [energyKwh, setEnergyKwh] = useState<number>(4.0);
  const [pricePerKwh, setPricePerKwh] = useState<number>(
    Number(state.marketMetrics.marketBasePricePerKwh.toFixed(3))
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const user = state.participants.find((p) => p.id === currentUserId) || state.participants[0];

  // User's cleared trades
  const userMatches = state.recentMatches.filter(
    (m) => m.buyerId === user.id || m.sellerId === user.id
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitOrder) return;

    const res = onSubmitOrder({
      participantId: user.id,
      type: tradeType,
      energyKwh,
      pricePerKwh,
      gridNodeId: user.gridNodeId,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => setStatusMessage(null), 6000);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* User Portal Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--cyan-400)' }}>
        <div className="card-header">
          <div>
            <span className="card-title" style={{ color: 'var(--cyan-400)' }}>
              <User size={22} /> Prosumer &amp; Consumer P2P Energy Dashboard
            </span>
            <span className="card-subtitle">
              Manage your rooftop PV generation, battery storage, wallet balance &amp; peer-to-peer energy trades
            </span>
          </div>

          {/* Account Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switch Account:</span>
            <select
              value={user.id}
              onChange={(e) => {
                setCurrentUserId(e.target.value);
                if (onSelectUser) onSelectUser(e.target.value);
              }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.82rem',
              }}
            >
              {state.participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) &bull; Tier {p.wealthTier}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Status Bar */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span className={`badge ${user.wealthTier === 1 ? 'badge-green' : user.wealthTier === 2 ? 'badge-cyan' : 'badge-amber'}`}>
            Tier {user.wealthTier} {user.role === 'PROSUMER_ELITE' ? 'Elite Prosumer' : user.role === 'PROSUMER_STANDARD' ? 'Standard Solar' : 'Consumer'}
          </span>
          <span className="badge badge-purple">
            <Lock size={11} /> Smart Meter DID: NMI_{user.gridNodeId}_084
          </span>
          <span className="badge badge-cyan">
            Connected to {user.gridNodeId.toUpperCase()} Lateral
          </span>
        </div>
      </div>

      {/* Real-Time Smart Meter Telemetry */}
      <div className="panel-grid">
        {/* Solar Generation Card */}
        <div className="stat-chip" style={{ gridColumn: 'span 3', borderLeft: '3px solid var(--amber-400)' }}>
          <div className="stat-chip-label">
            <Sun size={15} color="var(--amber-400)" /> Solar Generation
          </div>
          <div className="stat-chip-value" style={{ color: 'var(--amber-400)' }}>
            {user.currentGenerationKw.toFixed(1)} kW
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Installed PV: {user.pvCapacityKw.toFixed(1)} kW ({(state.solarIrradiancePu * 100).toFixed(0)}% sun)
          </div>
        </div>

        {/* Home Electricity Demand */}
        <div className="stat-chip" style={{ gridColumn: 'span 3', borderLeft: '3px solid var(--cyan-400)' }}>
          <div className="stat-chip-label">
            <Zap size={15} color="var(--cyan-400)" /> Household Load
          </div>
          <div className="stat-chip-value" style={{ color: 'var(--cyan-400)' }}>
            {user.baselineDemandKw.toFixed(1)} kW
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Net Power: <strong style={{ color: user.netDemandKw > 0 ? 'var(--amber-400)' : 'var(--green-400)' }}>
              {user.netDemandKw > 0 ? `-${user.netDemandKw} kW (Importing)` : `+${Math.abs(user.netDemandKw)} kW (Exporting)`}
            </strong>
          </div>
        </div>

        {/* Battery Storage */}
        <div className="stat-chip" style={{ gridColumn: 'span 3', borderLeft: '3px solid var(--green-400)' }}>
          <div className="stat-chip-label">
            <Battery size={15} color="var(--green-400)" /> Battery State of Charge
          </div>
          <div className="stat-chip-value" style={{ color: user.batteryCapacityKwh > 0 ? 'var(--green-400)' : 'var(--text-muted)' }}>
            {user.batteryCapacityKwh > 0 ? `${(user.batterySoC * 100).toFixed(0)}%` : 'No Battery'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Capacity: {user.batteryCapacityKwh > 0 ? `${user.batteryCapacityKwh} kWh` : 'Grid Dependent'}
          </div>
        </div>

        {/* Wallet Balance & Escrow */}
        <div className="stat-chip" style={{ gridColumn: 'span 3', borderLeft: '3px solid var(--purple-400)' }}>
          <div className="stat-chip-label">
            <DollarSign size={15} color="var(--purple-400)" /> Wallet &amp; Escrow
          </div>
          <div className="stat-chip-value" style={{ color: '#fff' }}>
            ${user.balance.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Locked Collateral: <strong style={{ color: 'var(--amber-400)' }}>${user.lockedEscrow.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* P2P Quick Trade Station */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <Zap size={18} color="var(--cyan-400)" /> Quick P2P Trading Station
            </span>
            <span className="card-subtitle">
              Submit peer-to-peer buy or sell orders matching your current net energy balance
            </span>
          </div>
          <span className="badge badge-green">INSTANT DOUBLE AUCTION</span>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Direction */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                TRADING ACTION:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTradeType('BUY')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: tradeType === 'BUY' ? '2px solid var(--cyan-400)' : '1px solid var(--border)',
                    background: tradeType === 'BUY' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: tradeType === 'BUY' ? 'var(--cyan-400)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowDownRight size={16} /> BUY ENERGY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('SELL')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: tradeType === 'SELL' ? '2px solid var(--green-400)' : '1px solid var(--border)',
                    background: tradeType === 'SELL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: tradeType === 'SELL' ? 'var(--green-400)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowUpRight size={16} /> SELL ENERGY
                </button>
              </div>
            </div>

            {/* Volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ENERGY AMOUNT:
                </label>
                <strong style={{ color: 'var(--cyan-400)', fontSize: '0.85rem' }}>{energyKwh.toFixed(1)} kWh</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={energyKwh}
                onChange={(e) => setEnergyKwh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan-400)' }}
              />
            </div>

            {/* Price */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  PRICE / kWh:
                </label>
                <strong style={{ color: 'var(--amber-400)', fontSize: '0.85rem' }}>${pricePerKwh.toFixed(3)}</strong>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.32"
                step="0.005"
                value={pricePerKwh}
                onChange={(e) => setPricePerKwh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--amber-400)' }}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: tradeType === 'BUY'
                    ? 'linear-gradient(135deg, var(--cyan-500), #0284c7)'
                    : 'linear-gradient(135deg, var(--green-500), #059669)',
                }}
              >
                <Send size={15} /> Execute {tradeType} (${(energyKwh * pricePerKwh).toFixed(2)})
              </button>
            </div>
          </div>

          {statusMessage && (
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: statusMessage.type === 'success' ? '1px solid var(--green-500)' : '1px solid var(--red-500)',
                color: statusMessage.type === 'success' ? 'var(--green-400)' : 'var(--red-400)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </form>
      </div>

      {/* Personal Settled Trade History */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <CheckCircle2 size={18} color="var(--green-400)" /> Your Settled Microgrid Trades ({userMatches.length})
            </span>
            <span className="card-subtitle">
              Cryptographically verified trade receipts with locked escrow smart contracts
            </span>
          </div>
          <span className="badge badge-green">ON-CHAIN SETTLEMENTS</span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Role</th>
                <th>Counterparty</th>
                <th>Energy Traded</th>
                <th>Price / kWh</th>
                <th>Gross Total</th>
                <th>Status</th>
                <th>Smart Contract Escrow</th>
              </tr>
            </thead>
            <tbody>
              {userMatches.map((m) => {
                const isUserBuyer = m.buyerId === user.id;
                return (
                  <tr key={m.tradeId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{m.tradeId}</td>
                    <td>
                      <span className={`badge ${isUserBuyer ? 'badge-cyan' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                        {isUserBuyer ? 'BUYER' : 'SELLER'}
                      </span>
                    </td>
                    <td>{isUserBuyer ? m.sellerId : m.buyerId}</td>
                    <td>{m.energyKwh.toFixed(2)} kWh</td>
                    <td style={{ color: 'var(--amber-400)', fontWeight: 600 }}>${m.clearedPricePerKwh.toFixed(3)}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>${m.grossAmount.toFixed(2)}</td>
                    <td>
                      <span className="badge badge-green">
                        <CheckCircle2 size={11} /> Settled
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--purple-400)' }}>
                      {m.escrowTxHash.slice(0, 16)}...
                    </td>
                  </tr>
                );
              })}
              {userMatches.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No trades executed for this node in the latest time step. Place a Buy/Sell order above or click &ldquo;Step +1h&rdquo;!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
