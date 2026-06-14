import React, { useState } from 'react';

export default function Sidebar({
  nodes,
  edges,
  selectedNode,
  startNode,
  endNode,
  activeRoute,
  mode,
  simulationSpeed,
  setMode,
  setStartNode,
  setEndNode,
  setSimulationSpeed,
  onFindRoute,
  onClearRoute,
  onTriggerRandomJams,
  onResetTraffic,
  onCalculateMST,
  onClearMST,
  onResetMap,
  isMstActive,
  onGoBack // Trigger transition back to Landing page
}) {
  const [activeTab, setActiveTab] = useState('navigation');
  const [algorithm, setAlgorithm] = useState('traffic');

  // Congestion index calculation (percentage of edges that are heavy or jammed)
  const getCongestionIndex = () => {
    if (edges.length === 0) return 0;
    const congestedCount = edges.filter(e => e.traffic === 'heavy' || e.traffic === 'jammed').length;
    return Math.round((congestedCount / edges.length) * 100);
  };

  const congestionIndex = getCongestionIndex();

  // Color mapping for congestion levels
  const getCongestionColor = (val) => {
    if (val < 25) return '#10b981'; // Green
    if (val < 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: '400px',
      height: '100%',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '20px',
      overflowY: 'auto'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="glow-text" style={{ fontSize: '1.6rem', color: '#a855f7', marginBottom: '4px' }}>
            MetroFlow
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            City Traffic Flow Optimizer
          </p>
        </div>
        {/* Back to Home Button */}
        <button
          className="btn-secondary"
          onClick={onGoBack}
          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
        >
          🏠 Home
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', paddingBottom: '2px', gap: '10px' }}>
        {['navigation', 'editor', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              background: activeTab === tab ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-purple)' : '2px solid transparent',
              color: activeTab === tab ? '#f8fafc' : '#64748b',
              padding: '8px 4px',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
              borderRadius: '6px 6px 0 0'
            }}
          >
            {tab === 'navigation' ? 'Directions' : (tab === 'editor' ? 'Planner' : 'Stats')}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 1. NAVIGATION/DIRECTIONS TAB */}
        {activeTab === 'navigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>Smart Navigation Engine</h3>
            
            {/* Start Node Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Start Intersection</label>
              <select 
                value={startNode?.id || ''} 
                onChange={(e) => setStartNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%' }}
              >
                <option value="">-- Select Origin Point --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name} {startNode?.id === node.id ? '(Start)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* End Node Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Destination Intersection</label>
              <select 
                value={endNode?.id || ''} 
                onChange={(e) => setEndNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%' }}
              >
                <option value="">-- Select Destination Point --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name} {endNode?.id === node.id ? '(End)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selector (renamed to non-technical titles) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Travel Path Priority</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="traffic">Intelligent Congestion-Dodging Route</option>
                <option value="dijkstra">Traditional Shortest Distance Route</option>
                <option value="astar">Direct Eco-Scenic Route</option>
              </select>
            </div>

            {/* Run Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                className="btn-primary"
                onClick={() => onFindRoute(algorithm)}
                disabled={!startNode || !endNode}
                style={{ flex: 2, padding: '10px', opacity: (!startNode || !endNode) ? 0.5 : 1 }}
              >
                Find Route
              </button>
              <button
                className="btn-secondary"
                onClick={onClearRoute}
                style={{ flex: 1, padding: '10px' }}
              >
                Clear
              </button>
            </div>

            {/* Route Stats Result Display (non-technical renames) */}
            {activeRoute && (
              <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Route Summary
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Route Priority:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {algorithm === 'traffic' ? 'Congestion-Dodging' : (algorithm === 'dijkstra' ? 'Traditional Shortest' : 'Direct Eco-Scenic')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Intersections Visited:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {activeRoute.path ? activeRoute.path.length : 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Total Travel Distance:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {activeRoute.totalCost ? Math.round(activeRoute.totalCost) : 0} meters
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MAP EDITOR & PLANNER TAB */}
        {activeTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Map Interaction Modes */}
            <div>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '8px' }}>Map Editor Tools</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setMode('select')}
                  style={{
                    backgroundColor: mode === 'select' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                    borderColor: mode === 'select' ? 'var(--accent-purple)' : 'var(--border-glass)',
                    color: '#fff',
                    padding: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔍 Inspect Intersection
                </button>
                <button
                  onClick={() => setMode('add-node')}
                  style={{
                    backgroundColor: mode === 'add-node' ? '#10b981' : 'rgba(255,255,255,0.05)',
                    borderColor: mode === 'add-node' ? '#10b981' : 'var(--border-glass)',
                    color: '#fff',
                    padding: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ➕ Place Intersection
                </button>
                <button
                  onClick={() => setMode('add-edge')}
                  style={{
                    backgroundColor: mode === 'add-edge' ? '#06b6d4' : 'rgba(255,255,255,0.05)',
                    borderColor: mode === 'add-edge' ? '#06b6d4' : 'var(--border-glass)',
                    color: '#fff',
                    padding: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔗 Link Intersections
                </button>
                <button
                  className="btn-danger"
                  onClick={() => setMode('delete')}
                  style={{
                    backgroundColor: mode === 'delete' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: mode === 'delete' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                    color: '#ff9999',
                    padding: '8px',
                    fontWeight: 600
                  }}
                >
                  🗑️ Removal Tool
                </button>
              </div>
            </div>

            {/* Simulation Speed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Traffic Simulation Speed</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {simulationSpeed === 0 ? 'PAUSED' : `${simulationSpeed}x`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
              />
            </div>

            {/* Quick Simulation Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>Simulation Operations</h3>
              <button
                className="btn-secondary"
                onClick={onTriggerRandomJams}
                style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                💥 Simulate Random Jams
              </button>
              <button
                className="btn-secondary"
                onClick={onResetTraffic}
                style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🟢 Clear Road Congestions
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={onCalculateMST}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', backgroundColor: isMstActive ? 'rgba(6, 182, 212, 0.15)' : '', borderColor: isMstActive ? '#06b6d4' : '' }}
                >
                  🕸️ Design Optimal Grid
                </button>
                {isMstActive && (
                  <button
                    className="btn-secondary"
                    onClick={onClearMST}
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    Clear Backbone
                  </button>
                )}
              </div>

              <button
                className="btn-danger"
                onClick={onResetMap}
                style={{ padding: '8px 12px', fontSize: '0.8rem', marginTop: '10px' }}
              >
                🔄 Reset Map to Default Grid
              </button>
            </div>
          </div>
        )}

        {/* 3. STATS/METRICS TAB */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>Real-time Traffic Metrics</h3>

            {/* Congestion Index Box */}
            <div className="glass-panel" style={{
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              borderLeft: `5px solid ${getCongestionColor(congestionIndex)}`
            }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>City Congestion Index</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: getCongestionColor(congestionIndex) }}>
                {congestionIndex}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {congestionIndex < 25 ? 'Flowing smoothly' : (congestionIndex < 60 ? 'Moderate delays observed' : 'SEVERE GRIDLOCK DETECTED')}
              </span>
            </div>

            {/* Network Count Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a855f7' }}>{nodes.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Intersections</div>
              </div>
              <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#06b6d4' }}>{edges.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Roadways</div>
              </div>
            </div>

            {/* Inspected Node Panel */}
            {selectedNode ? (
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#d8b4fe', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Intersection Inspector
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Name:</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedNode.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>ID:</span>
                    <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{selectedNode.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Coordinates:</span>
                    <span style={{ color: '#f8fafc' }}>Lat: {selectedNode.lat.toFixed(4)}, Lng: {selectedNode.lng.toFixed(4)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Traffic Light:</span>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase', color: selectedNode.trafficLight === 'red' ? '#ef4444' : '#10b981' }}>
                      {selectedNode.trafficLight} ({selectedNode.lightTimer || 5}s cycle)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.75rem', border: '1px dashed var(--border-glass)', borderRadius: '8px' }}>
                Select an intersection on the map in "Inspect Intersection" mode to view local coordinates and light details.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
        <span>MetroFlow v1.2</span>
        <span>Made with 💜</span>
      </div>
    </div>
  );
}
