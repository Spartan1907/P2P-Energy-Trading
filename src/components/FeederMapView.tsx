import React, { useState } from 'react';
import { Network, Gauge, Compass } from 'lucide-react';
import { SimulationState, GridNode } from '../core/types';

interface FeederMapViewProps {
  state: SimulationState;
}

export const FeederMapView: React.FC<FeederMapViewProps> = ({ state }) => {
  const [selectedNode, setSelectedNode] = useState<GridNode>(state.gridNodes[0]);

  const getNodeColor = (node: GridNode) => {
    if (node.isCongested || node.voltagePu < 0.93) return 'var(--red-500)';
    if (node.voltagePu < 0.97 || node.currentPowerFlowKw > node.lineCapacityKw * 0.8) return 'var(--amber-500)';
    return 'var(--green-500)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Feeder Map Overview Banner */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <Network size={20} color="var(--cyan-400)" /> IEEE Radial Distribution Feeder &amp; Power Flow Map
            </span>
            <span className="card-subtitle">
              Physical branch thermal capacity, downstream line impedance, and voltage drop tracking
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-green">8 LATERAL BUSES</span>
            <span className="badge badge-amber">D-LMP CONGESTION ADDERS</span>
          </div>
        </div>

        {/* Interactive SVG Feeder Visualization */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            overflowX: 'auto',
          }}
        >
          <svg viewBox="0 0 920 220" style={{ width: '100%', minWidth: '800px', height: '220px' }}>
            {/* Feeder Backbone Line */}
            <line x1="80" y1="110" x2="840" y2="110" stroke="#334155" strokeWidth="6" strokeDasharray="4 2" />

            {/* Substation Transformer */}
            <g transform="translate(60, 110)">
              <rect x="-35" y="-35" width="70" height="70" rx="12" fill="#1e293b" stroke="var(--cyan-400)" strokeWidth="2" />
              <text x="0" y="-8" fill="var(--cyan-400)" fontSize="11" fontWeight="700" textAnchor="middle">
                SUBSTATION
              </text>
              <text x="0" y="8" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle">
                TRANSFORMER
              </text>
              <text x="0" y="24" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                11kV / 230V
              </text>
            </g>

            {/* Render 8 Feeder Buses */}
            {state.gridNodes.map((node, idx) => {
              const xPos = 170 + idx * 95;
              const yPos = 110;
              const isSelected = selectedNode.id === node.id;
              const color = getNodeColor(node);
              const isEdge = idx >= 6;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                  transform={`translate(${xPos}, ${yPos})`}
                >
                  {/* Branch connector */}
                  <line x1="0" y1="-25" x2="0" y2="25" stroke="#475569" strokeWidth="3" />

                  {/* Pulsing ring if congested */}
                  {node.isCongested && (
                    <circle r="26" fill="none" stroke="var(--red-500)" strokeWidth="2" opacity="0.7">
                      <animate attributeName="r" values="20;30;20" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Bus Node Circle */}
                  <circle
                    r={isSelected ? '22' : '18'}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isSelected ? '3.5' : '2.5'}
                  />

                  <text x="0" y="5" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">
                    B{node.busNumber}
                  </text>

                  {/* Distance Indicator */}
                  <text x="0" y="40" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">
                    {node.distanceFromSubstationKm} km
                  </text>

                  {/* Voltage Tag */}
                  <text
                    x="0"
                    y="-34"
                    fill={node.voltagePu < 0.95 ? 'var(--red-400)' : 'var(--text-secondary)'}
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {node.voltagePu.toFixed(2)} pu
                  </text>

                  {/* Edge Indicator Badge */}
                  {isEdge && (
                    <text x="0" y="54" fill="var(--amber-400)" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      EDGE BUS
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Bus Diagnostics Panel */}
      <div className="panel-grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <Gauge size={18} color="var(--cyan-400)" /> Bus Node Telemetry: {selectedNode.name}
            </span>
            <span
              className={`badge ${
                selectedNode.isCongested ? 'badge-red' : selectedNode.voltagePu < 0.95 ? 'badge-amber' : 'badge-green'
              }`}
            >
              {selectedNode.isCongested ? 'CONGESTED OVERLOAD' : 'NORMAL DISPATCH'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="stat-chip">
              <div className="stat-chip-label">Distance from Substation</div>
              <div className="stat-chip-value">{selectedNode.distanceFromSubstationKm} km</div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Line Thermal Flow / Capacity</div>
              <div className="stat-chip-value" style={{ color: selectedNode.isCongested ? 'var(--red-400)' : 'inherit' }}>
                {selectedNode.currentPowerFlowKw.toFixed(1)} / {selectedNode.lineCapacityKw} kW
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Bus Voltage Magnitude</div>
              <div className="stat-chip-value" style={{ color: selectedNode.voltagePu < 0.95 ? 'var(--red-400)' : 'var(--green-400)' }}>
                {selectedNode.voltagePu.toFixed(3)} p.u. ({(selectedNode.voltagePu * 230).toFixed(1)} V)
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">D-LMP Congestion Surcharge</div>
              <div className="stat-chip-value" style={{ color: 'var(--amber-400)' }}>
                +${selectedNode.congestionSurchargePerKwh.toFixed(4)}/kWh
              </div>
            </div>
          </div>
        </div>

        {/* Feeder Physics Insight Card */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <span className="card-title">
              <Compass size={18} color="var(--purple-400)" /> RQ3: Grid-Aware Matching Analysis
            </span>
            <span className="badge badge-purple">PHYSICAL CONSTRAINTS</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p>
              In Smart Grid 2.0, transactive energy trading cannot ignore physical circuit laws. As energy flows through the radial feeder,
              it incurs <strong>I&sup2;R line losses</strong> and <strong>voltage drops</strong> that accumulate toward the terminal edge.
            </p>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--amber-400)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Topological Unfairness Warning:
              </div>
              Edge buses (B7, B8) experience the highest line impedance ({selectedNode.lineResistanceOhm.toFixed(2)} &Omega;) and face higher
              congestion surcharges ({selectedNode.congestionSurchargePerKwh > 0 ? `+$${selectedNode.congestionSurchargePerKwh.toFixed(4)}/kWh` : '0.00'})
              solely due to geographic position.
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              &rarr; See the <strong>Fairness &amp; Justice Audit</strong> tab to test the <em>Feeder Congestion Socialization Fund</em>, which pools
              and rebates these fees to protect edge households.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
