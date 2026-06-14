const express = require('express');
const router = express.Router();
const pathfinder = require('../services/pathfinder');

// Helper: Hydrate distances dynamically from geographical coordinates
function hydrateEdges(nodes, edges) {
  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });
  
  return edges.map(edge => {
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (!src || !dest) return { ...edge, distance: 300 };
    
    const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
    return {
      ...edge,
      distance: distance
    };
  });
}

// Pre-configured City Map Templates
const presetsSeeding = [
  {
    id: 'preset-manhattan',
    name: 'Manhattan Radial Grid (Default)',
    description: 'A radial-concentric layout around Union Square, NYC. Highly balanced and suitable for general simulation.',
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
      { id: 'e1', source: 'n9', target: 'n2', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e2', source: 'n2', target: 'n1', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e3', source: 'n1', target: 'n3', traffic: 'moderate', speedLimit: 40, lanes: 2 },
      { id: 'e4', source: 'n3', target: 'n6', traffic: 'clear', speedLimit: 50, lanes: 3 },
      { id: 'e5', source: 'n6', target: 'n8', traffic: 'heavy', speedLimit: 40, lanes: 1 },
      { id: 'e6', source: 'n8', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e7', source: 'n5', target: 'n7', traffic: 'jammed', speedLimit: 50, lanes: 2 },
      { id: 'e8', source: 'n7', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
      { id: 'e9', source: 'n4', target: 'n9', traffic: 'clear', speedLimit: 60, lanes: 3 },
      { id: 'e10', source: 'n1', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e11', source: 'n2', target: 'n5', traffic: 'heavy', speedLimit: 60, lanes: 2 },
      { id: 'e12', source: 'n3', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e13', source: 'n4', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'e14', source: 'n6', target: 'n5', traffic: 'moderate', speedLimit: 45, lanes: 2 },
      { id: 'e15', source: 'n1', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
      { id: 'e16', source: 'n3', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 }
    ]
  },
  {
    id: 'preset-expressway',
    name: 'Ring Expressway Loop',
    description: 'A peripheral loop highway operating at high speeds (80 km/h) enclosing slower, residential downtown neighborhoods.',
    nodes: [
      { id: 'rn1', name: 'North Expressway Exit', lat: 40.7420, lng: -74.0010, trafficLight: 'green', lightTimer: 6 },
      { id: 'rn2', name: 'East Expressway Exit', lat: 40.7220, lng: -73.9780, trafficLight: 'red', lightTimer: 7 },
      { id: 'rn3', name: 'South Expressway Exit', lat: 40.7020, lng: -74.0150, trafficLight: 'green', lightTimer: 8 },
      { id: 'rn4', name: 'West Expressway Exit', lat: 40.7220, lng: -74.0200, trafficLight: 'red', lightTimer: 5 },
      { id: 'rn5', name: 'Downtown Core Center', lat: 40.7220, lng: -73.9990, trafficLight: 'green', lightTimer: 4 },
      { id: 'rn6', name: 'North Residential Point', lat: 40.7320, lng: -73.9990, trafficLight: 'red', lightTimer: 5 },
      { id: 'rn7', name: 'South Residential Point', lat: 40.7120, lng: -73.9990, trafficLight: 'green', lightTimer: 6 }
    ],
    edges: [
      // Fast outer highway ring (80km/h speed limit, 3 lanes)
      { id: 're1', source: 'rn1', target: 'rn2', traffic: 'clear', speedLimit: 80, lanes: 3 },
      { id: 're2', source: 'rn2', target: 'rn3', traffic: 'clear', speedLimit: 80, lanes: 3 },
      { id: 're3', source: 'rn3', target: 'rn4', traffic: 'clear', speedLimit: 80, lanes: 3 },
      { id: 're4', source: 'rn4', target: 'rn1', traffic: 'clear', speedLimit: 80, lanes: 3 },
      
      // Slower residential links
      { id: 're5', source: 'rn1', target: 'rn6', traffic: 'clear', speedLimit: 40, lanes: 2 },
      { id: 're6', source: 'rn6', target: 'rn5', traffic: 'heavy', speedLimit: 40, lanes: 1 },
      { id: 're7', source: 'rn5', target: 'rn7', traffic: 'clear', speedLimit: 40, lanes: 2 },
      { id: 're8', source: 'rn7', target: 'rn3', traffic: 'clear', speedLimit: 40, lanes: 2 },
      
      // East-west inner corridors
      { id: 're9', source: 'rn4', target: 'rn5', traffic: 'moderate', speedLimit: 50, lanes: 2 },
      { id: 're10', source: 'rn5', target: 'rn2', traffic: 'jammed', speedLimit: 50, lanes: 2 }
    ]
  },
  {
    id: 'preset-bottleneck',
    name: 'Dual Sector Bottleneck Bridge',
    description: 'Two separate urban zones connected only by a single bridge roadway. Simulates high-density rush hour jams.',
    nodes: [
      // Left Sector
      { id: 'bn1', name: 'Zone A North', lat: 40.7300, lng: -74.0150, trafficLight: 'green', lightTimer: 5 },
      { id: 'bn2', name: 'Zone A South', lat: 40.7100, lng: -74.0150, trafficLight: 'red', lightTimer: 6 },
      { id: 'bn3', name: 'Zone A Transit Hub', lat: 40.7200, lng: -74.0100, trafficLight: 'green', lightTimer: 4 },
      // Right Sector
      { id: 'bn4', name: 'Zone B North', lat: 40.7300, lng: -73.9800, trafficLight: 'red', lightTimer: 6 },
      { id: 'bn5', name: 'Zone B South', lat: 40.7100, lng: -73.9800, trafficLight: 'green', lightTimer: 5 },
      { id: 'bn6', name: 'Zone B Transit Hub', lat: 40.7200, lng: -73.9850, trafficLight: 'green', lightTimer: 4 }
    ],
    edges: [
      // Left sector internal grid
      { id: 'be1', source: 'bn1', target: 'bn3', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'be2', source: 'bn2', target: 'bn3', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'be3', source: 'bn1', target: 'bn2', traffic: 'moderate', speedLimit: 40, lanes: 2 },
      
      // Right sector internal grid
      { id: 'be4', source: 'bn4', target: 'bn6', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'be5', source: 'bn5', target: 'bn6', traffic: 'clear', speedLimit: 50, lanes: 2 },
      { id: 'be6', source: 'bn4', target: 'bn5', traffic: 'moderate', speedLimit: 40, lanes: 2 },
      
      // The single bottleneck bridge roadway linking left to right
      { id: 'be7', source: 'bn3', target: 'bn6', traffic: 'jammed', speedLimit: 60, lanes: 2 }
    ]
  }
];

// Hydrate distances for presets
presetsSeeding.forEach(preset => {
  preset.edges = hydrateEdges(preset.nodes, preset.edges);
});

// Global Preset Store (in-memory)
let presets = [...presetsSeeding];

let currentMap = {
  nodes: presets[0].nodes,
  edges: presets[0].edges
};

// 1. Get current map
router.get('/map', (req, res) => {
  res.json(currentMap);
});

// 2. Update current map
router.post('/map', (req, res) => {
  const { nodes, edges } = req.body;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Invalid map format.' });
  }
  currentMap = { nodes, edges: hydrateEdges(nodes, edges) };
  res.json({ message: 'Map updated successfully', map: currentMap });
});

// 3. Compute route
router.post('/route', (req, res) => {
  const { startNodeId, endNodeId, algorithm } = req.body;
  if (!startNodeId || !endNodeId) {
    return res.status(400).json({ error: 'startNodeId and endNodeId are required.' });
  }

  const nodeIds = currentMap.nodes.map(n => n.id);
  if (!nodeIds.includes(startNodeId) || !nodeIds.includes(endNodeId)) {
    return res.status(404).json({ error: 'Start or end node not found in the graph.' });
  }

  let result;
  switch (algorithm) {
    case 'dijkstra':
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, false);
      break;
    case 'traffic':
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
      break;
    case 'astar':
      result = pathfinder.aStar(currentMap.nodes, currentMap.edges, startNodeId, endNodeId);
      break;
    default:
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
  }

  res.json({
    algorithm: algorithm || 'traffic',
    ...result
  });
});

// 4. Calculate MST
router.get('/mst', (req, res) => {
  const result = pathfinder.findMST(currentMap.nodes, currentMap.edges);
  res.json(result);
});

// 5. GET all map presets
router.get('/presets', (req, res) => {
  res.json(presets);
});

// 6. SAVE current map as a new preset
router.post('/presets', (req, res) => {
  const { name, description, nodes, edges } = req.body;
  if (!name || !Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Name, nodes, and edges are required to save a template.' });
  }

  const newPreset = {
    id: 'preset-' + Math.random().toString(36).substring(2, 9),
    name,
    description: description || 'User-designed city network configuration.',
    nodes,
    edges: hydrateEdges(nodes, edges)
  };

  presets.push(newPreset);
  res.json({ message: 'Template saved successfully', preset: newPreset });
});

// 7. DELETE custom preset
router.delete('/presets/:id', (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting preloaded configurations
  if (id === 'preset-manhattan' || id === 'preset-expressway' || id === 'preset-bottleneck') {
    return res.status(403).json({ error: 'Preloaded template grids cannot be removed.' });
  }

  const index = presets.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  presets.splice(index, 1);
  res.json({ message: 'Template deleted successfully', id });
});

module.exports = router;
