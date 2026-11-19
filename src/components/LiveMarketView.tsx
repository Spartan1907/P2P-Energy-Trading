import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lock,
} from 'lucide-react';
import { SimulationState, Participant } from '../core/types';

interface LiveMarketViewProps {
  state: SimulationState;
}

export const LiveMarketView: React.FC<LiveMarketViewProps> = ({ state }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const buyOrders = state.activeOrders.filter((o) => o.type === 'BUY').slice(0, 8);
  const sellOrders = state.activeOrders.filter((o) => o.type === 'SELL').slice(0, 8);

  const maxBuyPrice = Math.max(0.35, ...buyOrders.map((o) => o.pricePerKwh));
  const maxSellPrice = Math.max(0.35, ...sellOrders.map((o) => o.pricePerKwh));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Metrics Banner */}
      <div className="panel-grid">
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={18} color="var(--green-400)" /> Dynamic SDR Curve
            </span>
            <span className="badge badge-green">EQUILIBRIUM</span>
          </div>

          <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Main Grid Retail Price (Ceiling):</span>
              <strong style={{ color: 'var(--red-400)' }}>${state.marketMetrics.gridRetailPricePerKwh.toFixed(2)}/kWh</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dynamic Reserved Price P_res(SDR):</span>
              <strong style={{ color: 'var(--amber-400)' }}>${state.marketMetrics.marketBasePricePerKwh.toFixed(4)}/kWh</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Feed-in Tariff FiT (Floor):</span>
              <strong style={{ color: 'var(--green-400)' }}>${state.marketMetrics.feedInTariffPerKwh.toFixed(2)}/kWh</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Market Efficiency:</span>
              <strong style={{ color: 'var(--cyan-400)' }}>{state.marketMetrics.marketEfficiency.toFixed(1)}%</strong>
            </div>

            {/* SDR Visual Bar */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>Scarcity (High Demand)</span>
                <span>Surplus (High Solar)</span>
              </div>
              <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(5, state.marketMetrics.supplyDemandRatio * 35))}%`,
                    background: 'linear-gradient(90deg, var(--red-500), var(--amber-500), var(--green-500))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Order Book Card */}
        <div className="card" style={{ gridColumn: 'span 8' }}>
          <div className="card-header">
            <span className="card-title">
              <Lock size={18} color="var(--cyan-400)" /> Real-Time Sealed &amp; Revealed Order Book
            </span>
            <span className="badge badge-cyan">{state.activeOrders.length} ORDERS ACTIVE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* BUY Bids Column */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>BUY BIDS (CONSUMERS)</span>
                <span>PRICE / VOL</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {buyOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${(o.pricePerKwh / maxBuyPrice) * 100}%`,
                        background: 'rgba(6, 182, 212, 0.1)',
                        zIndex: 0,
                      }}
                    />
                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 600 }}>{o.participantId}</span>
                    <span style={{ position: 'relative', zIndex: 1, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
                      ${o.pricePerKwh.toFixed(3)} | {o.remainingEnergyKwh.toFixed(1)} kWh
                    </span>
                  </div>
                ))}
                {buyOrders.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No active buy orders</div>
                )}
              </div>
            </div>

            {/* SELL Asks Column */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>SELL ASKS (PROSUMERS)</span>
                <span>PRICE / VOL</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sellOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: `${(o.pricePerKwh / maxSellPrice) * 100}%`,
                        background: 'rgba(16, 185, 129, 0.1)',
                        zIndex: 0,
                      }}
                    />
                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 600 }}>{o.participantId}</span>
                    <span style={{ position: 'relative', zIndex: 1, color: 'var(--green-400)', fontFamily: 'var(--font-mono)' }}>
                      ${o.pricePerKwh.toFixed(3)} | {o.remainingEnergyKwh.toFixed(1)} kWh
                    </span>
                  </div>
                ))}
                {sellOrders.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No active sell orders</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cleared Trades Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <CheckCircle2 size={18} color="var(--green-400)" /> Recent Cleared Double Auction Settlements
          </span>
          <span className="badge badge-green">{state.recentMatches.length} TRADES CLEARED</span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Buyer &rarr; Seller</th>
                <th>Volume (kWh)</th>
                <th>Auction Price</th>
                <th>D-LMP Congestion Fee</th>
                <th>Gross Total</th>
                <th>Delivery Status</th>
                <th>Escrow Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {state.recentMatches.map((m) => (
                <tr key={m.tradeId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{m.tradeId}</td>
                  <td>
                    <strong>{m.buyerId}</strong> &rarr; <strong>{m.sellerId}</strong>
                  </td>
                  <td>{m.energyKwh.toFixed(2)} kWh</td>
                  <td style={{ color: 'var(--amber-400)', fontWeight: 600 }}>
                    ${m.clearedPricePerKwh.toFixed(3)}/kWh
                  </td>
                  <td style={{ color: m.congestionSurcharge > 0 ? 'var(--red-400)' : 'var(--text-muted)' }}>
                    +${m.congestionSurcharge.toFixed(3)}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${m.grossAmount.toFixed(2)}
                  </td>
                  <td>
                    {m.status === 'SETTLED' ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} /> Settled
                      </span>
                    ) : m.status.includes('DEFAULTED') ? (
                      <span className="badge badge-red">
                        <AlertTriangle size={12} /> Defaulted (Slashed)
                      </span>
                    ) : (
                      <span className="badge badge-cyan">Pending</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--purple-400)' }}>
                    {m.escrowTxHash.slice(0, 16)}...
                  </td>
                </tr>
              ))}
              {state.recentMatches.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No trades cleared in this time step. Click &ldquo;Step +1h&rdquo; or &ldquo;Start 24h Sim&rdquo; to advance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Inspector Modal / Quick Cards */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={18} color="var(--purple-400)" /> Microgrid Participant Fleet Inspector
          </span>
          <span className="badge badge-purple">{state.participants.length} REGISTERED NODES</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {state.participants.slice(0, 12).map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedParticipant(p)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: selectedParticipant?.id === p.id ? '1px solid var(--green-400)' : '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>{p.id}</strong>
                <span
                  className={`badge ${
                    p.wealthTier === 1 ? 'badge-green' : p.wealthTier === 2 ? 'badge-cyan' : 'badge-amber'
                  }`}
                  style={{ fontSize: '0.65rem' }}
                >
                  Tier {p.wealthTier}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                <div>PV: {p.pvCapacityKw > 0 ? `${p.pvCapacityKw.toFixed(1)} kW` : 'None'}</div>
                <div>Battery: {p.batteryCapacityKwh > 0 ? `${(p.batterySoC * 100).toFixed(0)}% (${p.batteryCapacityKwh} kWh)` : 'None'}</div>
                <div style={{ color: p.reputation.score >= 0.6 ? 'var(--green-400)' : 'var(--amber-400)', fontWeight: 600 }}>
                  Reputation Score: {p.reputation.score.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
