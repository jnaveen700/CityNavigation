import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LeafletMap from './components/LeafletMap';
import Sidebar from './components/Sidebar';
import Legend from './components/Legend';
import PresetsPage from './components/PresetsPage';
import GuidePage from './components/GuidePage';

// Client side helper: calculate Haversine distance in meters
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Default seeded city map in Manhattan, NY
const DEFAULT_MAP = {
  nodes: [
    { id: 'n1', name: 'Manhattan City Hall', lat: 40.7128, lng: -74.0060, trafficLight: 'green', lightTimer: 8 },
    { id: 'n2', name: 'Wall Street bull', lat: 40.7069, lng: -74.0113, trafficLight: 'red', lightTimer: 5 },
    { id: 'n3', name: 'Chinatown Square', lat: 40.7158, lng: -73.9967, trafficLight: 'green', lightTimer: 6 },
    { id: 'n4', name: 'Tribeca Junction', lat: 40.7182, lng: -74.0083, trafficLight: 'red', lightTimer: 10 },
    { id: 'n5', name: 'Union Square Hub', lat: 40.7308, lng: -73.9973, trafficLight: 'green', lightTimer: 4 },
    { id: 'n6', name: 'East Village Crossing', lat: 40.7265, lng: -73.9815, trafficLight: 'red', lightTimer: 7 },
    { id: 'n7', name: 'Greenwich Village Gate', lat: 40.7336, lng: -74.0027, trafficLight: 'green', lightTimer: 6 },
    { id: 'n8', name: 'Stuyvesant Town Circle', lat: 40.7317, lng: -73.9784, trafficLight: 'red', lightTimer: 9 },
    { id: 'n9', name: 'Battery Park Esplanade', lat: 40.7033, lng: -74.0170, trafficLight: 'green', lightTimer: 8 }
  ],
  edges: [
    { id: 'e1', source: 'n9', target: 'n2', distance: 800, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e2', source: 'n2', target: 'n1', distance: 700, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e3', source: 'n1', target: 'n3', distance: 1100, traffic: 'moderate', speedLimit: 40, lanes: 2 },
    { id: 'e4', source: 'n3', target: 'n6', distance: 1600, traffic: 'clear', speedLimit: 50, lanes: 3 },
    { id: 'e5', source: 'n6', target: 'n8', distance: 600, traffic: 'heavy', speedLimit: 40, lanes: 1 },
    { id: 'e6', source: 'n8', target: 'n5', distance: 1600, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e7', source: 'n5', target: 'n7', distance: 600, traffic: 'jammed', speedLimit: 50, lanes: 2 },
    { id: 'e8', source: 'n7', target: 'n4', distance: 1800, traffic: 'clear', speedLimit: 40, lanes: 2 },
    { id: 'e9', source: 'n4', target: 'n9', distance: 1800, traffic: 'clear', speedLimit: 60, lanes: 3 },
    { id: 'e10', source: 'n1', target: 'n5', distance: 2200, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e11', source: 'n2', target: 'n5', distance: 2900, traffic: 'heavy', speedLimit: 60, lanes: 2 },
    { id: 'e12', source: 'n3', target: 'n5', distance: 1700, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e13', source: 'n4', target: 'n5', distance: 1600, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e14', source: 'n6', target: 'n5', distance: 1400, traffic: 'moderate', speedLimit: 45, lanes: 2 },
    { id: 'e15', source: 'n1', target: 'n4', distance: 600, traffic: 'clear', speedLimit: 40, lanes: 2 },
    { id: 'e16', source: 'n3', target: 'n4', distance: 1000, traffic: 'clear', speedLimit: 40, lanes: 2 }
  ]
};

const streetPrefixes = ['Pine', 'Oak', 'Maple', 'Cedar', 'Elm', 'Sunset', 'Grand', 'Lexington', 'Broadway', 'Central', 'Park', 'Industrial', 'Harbor'];
const streetSuffixes = ['Avenue', 'Blvd', 'Street', 'Crossing', 'Square', 'Way', 'Junction', 'Hub'];

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'app', 'presets', 'guide'
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  
  const [mode, setMode] = useState('select'); // 'select', 'add-node', 'add-edge', 'delete'
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [apiError, setApiError] = useState(null);

  // Fetch current map from backend
  const fetchMap = async () => {
    try {
      const response = await fetch('/api/map');
      if (!response.ok) throw new Error('Failed to fetch map from server');
      const data = await response.json();
      setNodes(data.nodes);
      setEdges(data.edges);
      setApiError(null);
    } catch (err) {
      console.warn('API error, falling back to local simulation data:', err);
      setNodes(DEFAULT_MAP.nodes);
      setEdges(DEFAULT_MAP.edges);
      setApiError('Connected to local storage. Running in offline fallback mode.');
    }
  };

  useEffect(() => {
    fetchMap();
  }, []);

  // Save current map to backend
  const saveMap = async (newNodes, newEdges) => {
    try {
      const response = await fetch('/api/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: newNodes, edges: newEdges })
      });
      if (!response.ok) throw new Error('Failed to update map');
      const data = await response.json();
      setNodes(data.map.nodes);
      setEdges(data.map.edges);
    } catch (err) {
      console.error('Save failed, updating local state only:', err);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  // Add a new intersection node (click on Map)
  const handleAddNode = (coords) => {
    const prefix = streetPrefixes[Math.floor(Math.random() * streetPrefixes.length)];
    const suffix = streetSuffixes[Math.floor(Math.random() * streetSuffixes.length)];
    const nodeName = `${prefix} ${suffix}`;
    const nodeId = 'n_' + Math.random().toString(36).substring(2, 9);
    
    const newNode = {
      id: nodeId,
      name: nodeName,
      lat: coords.lat,
      lng: coords.lng,
      trafficLight: Math.random() > 0.5 ? 'green' : 'red',
      lightTimer: 5 + Math.floor(Math.random() * 6)
    };

    const updatedNodes = [...nodes, newNode];
    saveMap(updatedNodes, edges);
  };

  // Add a new road connection
  const handleAddRoad = (sourceId, targetId) => {
    const roadExists = edges.some(e => 
      (e.source === sourceId && e.target === targetId) || 
      (e.source === targetId && e.target === sourceId)
    );

    if (roadExists) {
      alert('A road already connects these two intersections.');
      return;
    }

    const srcNode = nodes.find(n => n.id === sourceId);
    const destNode = nodes.find(n => n.id === targetId);
    if (!srcNode || !destNode) return;

    const distance = Math.round(getHaversineDistance(srcNode.lat, srcNode.lng, destNode.lat, destNode.lng));
    const roadId = 'e_' + Math.random().toString(36).substring(2, 9);

    const newRoad = {
      id: roadId,
      source: sourceId,
      target: targetId,
      distance: distance,
      traffic: 'clear',
      speedLimit: 50 + (Math.random() > 0.6 ? 20 : 0),
      lanes: Math.random() > 0.5 ? 3 : 2
    };

    const updatedEdges = [...edges, newRoad];
    saveMap(nodes, updatedEdges);
  };

  // Delete a node and all connecting roads
  const handleDeleteNode = (nodeId) => {
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    if (startNode?.id === nodeId) setStartNode(null);
    if (endNode?.id === nodeId) setEndNode(null);
    
    handleClearRoute();
    setMstEdges([]);
    
    saveMap(updatedNodes, updatedEdges);
  };

  // Delete a road
  const handleDeleteEdge = (edgeId) => {
    const updatedEdges = edges.filter(e => e.id !== edgeId);
    handleClearRoute();
    setMstEdges([]);
    saveMap(nodes, updatedEdges);
  };

  // Calculate route using API
  const handleFindRoute = async (algorithm) => {
    if (!startNode || !endNode) return;
    
    setMstEdges([]);

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startNodeId: startNode.id,
          endNodeId: endNode.id,
          algorithm
        })
      });

      if (!response.ok) throw new Error('API route failed');
      const data = await response.json();
      
      if (!data.path || data.path.length === 0) {
        alert('No path exists between these two intersections.');
        handleClearRoute();
        return;
      }

      setActiveRoute({
        path: data.path,
        pathEdges: data.pathEdges,
        totalCost: data.totalCost
      });
      setVisitedNodes(data.visited);
    } catch (err) {
      console.warn('API route failed:', err);
      alert('Routing engine connection failed. Please check if the backend is running.');
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setVisitedNodes([]);
  };

  // Inject Random Traffic Bottlenecks
  const handleTriggerRandomJams = () => {
    const levels = ['clear', 'moderate', 'heavy', 'jammed'];
    const updatedEdges = edges.map(edge => {
      if (Math.random() < 0.35) {
        const idx = Math.floor(Math.random() * levels.length);
        return { ...edge, traffic: levels[idx] };
      }
      return edge;
    });
    saveMap(nodes, updatedEdges);
    handleClearRoute();
  };

  // Clear all traffic levels back to clear
  const handleResetTraffic = () => {
    const updatedEdges = edges.map(edge => ({ ...edge, traffic: 'clear' }));
    saveMap(nodes, updatedEdges);
    handleClearRoute();
  };

  // Calculate Minimum Spanning Tree (MST)
  const handleCalculateMST = async () => {
    handleClearRoute();

    try {
      const response = await fetch('/api/mst');
      if (!response.ok) throw new Error('MST computation error');
      const data = await response.json();
      setMstEdges(data.mstEdges);
    } catch (err) {
      console.error('MST calculation error:', err);
      alert('MST service unavailable. Make sure backend is running.');
    }
  };

  const handleClearMST = () => {
    setMstEdges([]);
  };

  // Reset entire map back to initial seeds
  const handleResetMap = () => {
    if (window.confirm('Are you sure you want to reset the map and overwrite all changes?')) {
      handleClearRoute();
      setMstEdges([]);
      setSelectedNode(null);
      setStartNode(null);
      setEndNode(null);
      saveMap(DEFAULT_MAP.nodes, DEFAULT_MAP.edges);
    }
  };

  // Main Conditional View Render
  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('app')} />;
  }

  if (view === 'presets') {
    return (
      <PresetsPage
        currentNodes={nodes}
        currentEdges={edges}
        onLoadMap={(newNodes, newEdges) => {
          setSelectedNode(null);
          setStartNode(null);
          setEndNode(null);
          handleClearRoute();
          setMstEdges([]);
          saveMap(newNodes, newEdges);
          setView('app');
        }}
        onBack={() => setView('app')}
      />
    );
  }

  if (view === 'guide') {
    return (
      <GuidePage
        onBack={() => setView('app')}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* 1. APP HEADER NAVIGATION BAR (Sleek multi page routing) */}
      <header style={{
        background: 'rgba(10, 17, 32, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('landing')}>
          <span style={{ fontSize: '1.4rem' }}>🚦</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem' }}>
            Urban<span style={{ color: '#a855f7' }}>Pulse</span>
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <button 
            onClick={() => setView('app')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: view === 'app' ? '#a855f7' : '#94a3b8', 
              fontWeight: view === 'app' ? 700 : 500, 
              cursor: 'pointer',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            🌐 Live Simulator Map
          </button>
          <button 
            onClick={() => setView('presets')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: view === 'presets' ? '#a855f7' : '#94a3b8', 
              fontWeight: view === 'presets' ? 700 : 500, 
              cursor: 'pointer',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            🗺️ Preset Templates
          </button>
          <button 
            onClick={() => setView('guide')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: view === 'guide' ? '#a855f7' : '#94a3b8', 
              fontWeight: view === 'guide' ? 700 : 500, 
              cursor: 'pointer',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            📖 Planning Guide
          </button>
        </nav>
      </header>

      {/* Top Banner Alert (API offline check) */}
      {apiError && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          fontSize: '0.8rem',
          textAlign: 'center',
          padding: '6px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999
        }}>
          ⚠️ {apiError}
          <button 
            onClick={fetchMap}
            style={{ 
              background: 'rgba(245,158,11,0.2)', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              fontSize: '0.75rem', 
              padding: '2px 8px', 
              borderRadius: '4px' 
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Container */}
      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Map Visualizer */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: '20px',
          gap: '15px'
        }}>
          {/* Map Wrapper */}
          <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <LeafletMap
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              startNode={startNode}
              endNode={endNode}
              activeRoute={activeRoute}
              visitedNodes={visitedNodes}
              mstEdges={mstEdges}
              mode={mode}
              simulationSpeed={simulationSpeed}
              onCanvasClick={handleAddNode}
              onNodeSelect={setSelectedNode}
              onAddRoad={handleAddRoad}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
            />
          </div>
          
          {/* Map Legend */}
          <Legend />
        </div>

        {/* Right Side: Sidebar Controls */}
        <div style={{
          padding: '20px 20px 20px 0',
          height: '100%',
          overflow: 'hidden'
        }}>
          <Sidebar
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            startNode={startNode}
            endNode={endNode}
            activeRoute={activeRoute}
            mode={mode}
            simulationSpeed={simulationSpeed}
            setMode={setMode}
            setStartNode={setStartNode}
            setEndNode={setEndNode}
            setSimulationSpeed={setSimulationSpeed}
            onFindRoute={handleFindRoute}
            onClearRoute={handleClearRoute}
            onTriggerRandomJams={handleTriggerRandomJams}
            onResetTraffic={handleResetTraffic}
            onCalculateMST={handleCalculateMST}
            onClearMST={handleClearMST}
            onResetMap={handleResetMap}
            isMstActive={mstEdges.length > 0}
            onGoBack={() => setView('landing')}
          />
        </div>

      </div>
    </div>
  );
}
