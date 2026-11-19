import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  DollarSign,
  Send,
} from 'lucide-react';
import { SimulationState, Participant } from '../core/types';

interface LiveMarketViewProps {
  state: SimulationState;
  onSubmitOrder?: (params: {
    participantId: string;
    type: 'BUY' | 'SELL';
    energyKwh: number;
    pricePerKwh: number;
    gridNodeId?: string;
  }) => { success: boolean; orderId: string; message: string; txHash?: string };
}

export const LiveMarketView: React.FC<LiveMarketViewProps> = ({ state, onSubmitOrder }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Trading Terminal State
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedTraderId, setSelectedTraderId] = useState<string>(
    state.participants[2]?.id || state.participants[0]?.id || 'node_user_1'
  );
  const [energyAmount, setEnergyAmount] = useState<number>(3.5);
  const [pricePerKwh, setPricePerKwh] = useState<number>(
    Number(state.marketMetrics.marketBasePricePerKwh.toFixed(3))
  );
  const [selectedGridNode, setSelectedGridNode] = useState<string>('node-3');
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    txHash?: string;
  } | null>(null);

  const activeTrader = state.participants.find((p) => p.id === selectedTraderId) || state.participants[0];

  const buyOrders = state.activeOrders.filter((o) => o.type === 'BUY').slice(0, 8);
  const sellOrders = state.activeOrders.filter((o) => o.type === 'SELL').slice(0, 8);

  const maxBuyPrice = Math.max(0.35, ...buyOrders.map((o) => o.pricePerKwh));
  const maxSellPrice = Math.max(0.35, ...sellOrders.map((o) => o.pricePerKwh));

  // Calculations for current form
  const estimatedGrossCost = Number((energyAmount * pricePerKwh).toFixed(2));
  const estimatedCollateralStake = Number(
    (estimatedGrossCost * (state.fairnessPolicies.dynamicStakingEnabled ? Math.max(0.2, 1.4 - activeTrader.reputation.score * 1.1) : 1.5)).toFixed(2)
  );

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitOrder) return;

    if (energyAmount <= 0) {
      setSubmissionFeedback({ type: 'error', text: 'Energy volume must be greater than 0 kWh.' });
      return;
    }
    if (pricePerKwh <= 0) {
      setSubmissionFeedback({ type: 'error', text: 'Price must be greater than $0.00/kWh.' });
      return;
    }

    const res = onSubmitOrder({
      participantId: selectedTraderId,
      type: orderType,
      energyKwh: energyAmount,
      pricePerKwh: pricePerKwh,
      gridNodeId: selectedGridNode,
    });

    if (res.success) {
      setSubmissionFeedback({
        type: 'success',
        text: res.message,
        txHash: res.txHash,
      });
      // Clear message after 6 seconds
      setTimeout(() => setSubmissionFeedback(null), 6000);
    } else {
      setSubmissionFeedback({
        type: 'error',
        text: res.message,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Interactive P2P Energy Trading Terminal */}
      <div className="card" style={{ borderTop: '3px solid var(--cyan-400)' }}>
        <div className="card-header">
          <div>
            <span className="card-title">
              <Zap size={20} color="var(--cyan-400)" /> Interactive P2P Trading Terminal (Buy &amp; Sell Option)
            </span>
            <span className="card-subtitle">
              Place manual peer-to-peer sealed-bid energy orders directly into the double auction order book &amp; blockchain ledger
            </span>
          </div>
          <span className="badge badge-cyan">DECENTRALIZED EXCHANGE</span>
        </div>

        <form onSubmit={handleExecuteOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Column 1: Order Direction & Trader Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  ORDER DIRECTION:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('BUY');
                      setPricePerKwh(Number(Math.min(0.32, state.marketMetrics.marketBasePricePerKwh * 1.05).toFixed(3)));
                    }}
                    style={{
                      padding: '0.7rem',
                      borderRadius: '10px',
                      border: orderType === 'BUY' ? '2px solid var(--cyan-400)' : '1px solid var(--border)',
                      background: orderType === 'BUY' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: orderType === 'BUY' ? 'var(--cyan-400)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ArrowDownRight size={18} /> BUY ENERGY
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('SELL');
                      setPricePerKwh(Number(Math.max(0.08, state.marketMetrics.marketBasePricePerKwh * 0.95).toFixed(3)));
                    }}
                    style={{
                      padding: '0.7rem',
                      borderRadius: '10px',
                      border: orderType === 'SELL' ? '2px solid var(--green-400)' : '1px solid var(--border)',
                      background: orderType === 'SELL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: orderType === 'SELL' ? 'var(--green-400)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ArrowUpRight size={18} /> SELL ENERGY
                  </button>
                </div>
              </div>

              {/* Trader Identity Dropdown */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  TRADING AS PARTICIPANT IDENTITY:
                </label>
                <select
                  value={selectedTraderId}
                  onChange={(e) => setSelectedTraderId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                  }}
                >
                  {state.participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) &bull; Tier {p.wealthTier} &bull; Score: {p.reputation.score.toFixed(2)}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wallet Balance: <strong style={{ color: 'var(--green-400)' }}>${activeTrader.balance.toFixed(2)}</strong></span>
                  <span>PV Capacity: <strong>{activeTrader.pvCapacityKw} kW</strong></span>
                </div>
              </div>

              {/* Grid Node Lateral Location */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  FEEDER LATERAL NODE:
                </label>
                <select
                  value={selectedGridNode}
                  onChange={(e) => setSelectedGridNode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                  }}
                >
                  {state.gridNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      Bus {n.busNumber} &mdash; {n.name} ({n.distanceFromSubstationKm} km, {n.voltagePu.toFixed(2)} pu)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column 2: Volume & Price Setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ENERGY VOLUME (kWh):
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
                    {energyAmount.toFixed(1)} kWh
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={energyAmount}
                  onChange={(e) => setEnergyAmount(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--cyan-400)' }}
                />
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {[1, 2.5, 5, 10, 15].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEnergyAmount(amt)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        background: energyAmount === amt ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {amt} kWh
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    BID / ASK PRICE ($/kWh):
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--amber-400)', fontWeight: 700 }}>
                    ${pricePerKwh.toFixed(3)}/kWh
                  </span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>Floor (FiT): $0.08</span>
                  <span style={{ color: 'var(--amber-400)' }}>Mid P_res: ${state.marketMetrics.marketBasePricePerKwh.toFixed(3)}</span>
                  <span>Ceiling (Retail): $0.32</span>
                </div>
              </div>
            </div>

            {/* Column 3: Live Summary & Action Button */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  Order Summary (Sealed-Bid)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gross Order Value:</span>
                  <strong style={{ color: '#fff' }}>${estimatedGrossCost.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Required Escrow Collateral:</span>
                  <strong style={{ color: 'var(--amber-400)' }}>${estimatedCollateralStake.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Privacy Protocol:</span>
                  <span style={{ color: 'var(--purple-400)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                    SHA-256 Hash Commitment
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  background: orderType === 'BUY'
                    ? 'linear-gradient(135deg, var(--cyan-500), #0284c7)'
                    : 'linear-gradient(135deg, var(--green-500), #059669)',
                }}
              >
                <Send size={16} /> Sign &amp; Submit {orderType} Order
              </button>
            </div>
          </div>

          {/* Submission Feedback Alert */}
          {submissionFeedback && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: submissionFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: submissionFeedback.type === 'success' ? '1px solid var(--green-500)' : '1px solid var(--red-500)',
                color: submissionFeedback.type === 'success' ? 'var(--green-400)' : 'var(--red-400)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {submissionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{submissionFeedback.text}</span>
              </div>
              {submissionFeedback.txHash && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--purple-400)' }}>
                  Tx: {submissionFeedback.txHash.slice(0, 16)}...
                </span>
              )}
            </div>
          )}
        </form>
      </div>

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
                {buyOrders.map((o) => {
                  const isUserOrder = o.id.includes('ORD_USER');
                  return (
                    <div
                      key={o.id}
                      style={{
                        background: isUserOrder ? 'rgba(6, 182, 212, 0.22)' : 'rgba(6, 182, 212, 0.08)',
                        border: isUserOrder ? '1.5px solid var(--cyan-400)' : '1px solid rgba(6, 182, 212, 0.2)',
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
                      <span style={{ position: 'relative', zIndex: 1, fontWeight: 600 }}>
                        {isUserOrder && <span className="badge badge-cyan" style={{ fontSize: '0.6rem', marginRight: '0.3rem' }}>YOU</span>}
                        {o.participantId}
                      </span>
                      <span style={{ position: 'relative', zIndex: 1, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
                        ${o.pricePerKwh.toFixed(3)} | {o.remainingEnergyKwh.toFixed(1)} kWh
                      </span>
                    </div>
                  );
                })}
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
                {sellOrders.map((o) => {
                  const isUserOrder = o.id.includes('ORD_USER');
                  return (
                    <div
                      key={o.id}
                      style={{
                        background: isUserOrder ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.08)',
                        border: isUserOrder ? '1.5px solid var(--green-400)' : '1px solid rgba(16, 185, 129, 0.2)',
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
                      <span style={{ position: 'relative', zIndex: 1, fontWeight: 600 }}>
                        {isUserOrder && <span className="badge badge-green" style={{ fontSize: '0.6rem', marginRight: '0.3rem' }}>YOU</span>}
                        {o.participantId}
                      </span>
                      <span style={{ position: 'relative', zIndex: 1, color: 'var(--green-400)', fontFamily: 'var(--font-mono)' }}>
                        ${o.pricePerKwh.toFixed(3)} | {o.remainingEnergyKwh.toFixed(1)} kWh
                      </span>
                    </div>
                  );
                })}
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
              onClick={() => {
                setSelectedParticipant(p);
                setSelectedTraderId(p.id);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: (selectedParticipant?.id === p.id || selectedTraderId === p.id)
                  ? '1px solid var(--green-400)'
                  : '1px solid var(--border)',
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
