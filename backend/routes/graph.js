const express = require('express');
const router = express.Router();
const pathfinder = require('../services/pathfinder');

// Initial default city map centered in Manhattan, NY (lat/lng coordinates)
const defaultNodes = [
  { id: 'n1', name: 'Manhattan City Hall', lat: 40.7128, lng: -74.0060, trafficLight: 'green', lightTimer: 8 },
  { id: 'n2', name: 'Wall Street bull', lat: 40.7069, lng: -74.0113, trafficLight: 'red', lightTimer: 5 },
  { id: 'n3', name: 'Chinatown Square', lat: 40.7158, lng: -73.9967, trafficLight: 'green', lightTimer: 6 },
  { id: 'n4', name: 'Tribeca Junction', lat: 40.7182, lng: -74.0083, trafficLight: 'red', lightTimer: 10 },
  { id: 'n5', name: 'Union Square Hub', lat: 40.7308, lng: -73.9973, trafficLight: 'green', lightTimer: 4 },
  { id: 'n6', name: 'East Village Crossing', lat: 40.7265, lng: -73.9815, trafficLight: 'red', lightTimer: 7 },
  { id: 'n7', name: 'Greenwich Village Gate', lat: 40.7336, lng: -74.0027, trafficLight: 'green', lightTimer: 6 },
  { id: 'n8', name: 'Stuyvesant Town Circle', lat: 40.7317, lng: -73.9784, trafficLight: 'red', lightTimer: 9 },
  { id: 'n9', name: 'Battery Park Esplanade', lat: 40.7033, lng: -74.0170, trafficLight: 'green', lightTimer: 8 }
];

const rawEdges = [
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
];

// Fallback straight-line hydration
function hydrateEdgesFallback(nodes, edges) {
  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });
  
  return edges.map(edge => {
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (!src || !dest) return { ...edge, distance: 300, geometry: null };
    
    const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
    return {
      ...edge,
      distance: distance,
      geometry: null
    };
  });
}

// Global active store
let currentMap = {
  nodes: defaultNodes,
  edges: hydrateEdgesFallback(defaultNodes, rawEdges)
};

// Global Preset Store with OSRM geometries placeholder
let presets = [
  {
    id: 'preset-manhattan',
    name: 'Manhattan Radial Grid (Default)',
    description: 'A radial-concentric layout around Union Square, NYC. Highly balanced and suitable for general simulation.',
    nodes: defaultNodes,
    edges: hydrateEdgesFallback(defaultNodes, rawEdges)
  }
];

// OSRM API Geometry fetcher
async function getRoadGeometry(src, dest) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM Server Error');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const distance = Math.round(data.routes[0].distance);
      const geometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      return { distance, geometry };
    }
  } catch (err) {
    console.warn(`OSRM failed for [${src.name} -> ${dest.name}], falling back to straight line.`);
  }
  
  const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
  return { distance, geometry: null };
}

// OSRM API Route fetcher for arbitrary coordinates
async function getOSRMRoute(src, dest) {
  const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM Server Error');
  const data = await res.json();
  if (data.code === 'Ok' && data.routes && data.routes[0]) {
    const distance = Math.round(data.routes[0].distance);
    const geometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    return { distance, geometry };
  }
  throw new Error('No route found by OSRM');
}

// Background Hydrator on Start
async function hydrateInitialMapGeometries() {
  console.log('Fetching real-world street geometries from OSRM...');
  const nodesMap = {};
  currentMap.nodes.forEach(n => { nodesMap[n.id] = n; });

  const updatedEdges = [];
  for (const edge of currentMap.edges) {
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (src && dest) {
      const roadData = await getRoadGeometry(src, dest);
      updatedEdges.push({
        ...edge,
        distance: roadData.distance,
        geometry: roadData.geometry
      });
    } else {
      updatedEdges.push(edge);
    }
    // Throttle requests slightly (60ms) to respect OSRM public servers
    await new Promise(r => setTimeout(r, 60));
  }
  currentMap.edges = updatedEdges;
  presets[0].edges = updatedEdges; // sync default template
  console.log('OSRM street geometries successfully loaded!');
}

setTimeout(hydrateInitialMapGeometries, 1000); // Trigger shortly after startup

// 1. Get current map
router.get('/map', (req, res) => {
  res.json(currentMap);
});

// 2. Update current map (re-hydrates dynamically if geometry missing)
router.post('/map', async (req, res) => {
  const { nodes, edges } = req.body;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Invalid map format.' });
  }

  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });

  const updatedEdges = [];
  for (const edge of edges) {
    // If geometry is already computed, keep it; otherwise fetch
    if (edge.geometry && edge.geometry.length > 0) {
      updatedEdges.push(edge);
    } else {
      const src = nodesMap[edge.source];
      const dest = nodesMap[edge.target];
      if (src && dest) {
        const roadData = await getRoadGeometry(src, dest);
        updatedEdges.push({
          ...edge,
          distance: roadData.distance,
          geometry: roadData.geometry
        });
      } else {
        updatedEdges.push(edge);
      }
    }
  }

  currentMap = { nodes, edges: updatedEdges };
  res.json({ message: 'Map updated successfully', map: currentMap });
});

// 3. Compute route
router.post('/route', async (req, res) => {
  const { startNodeId, endNodeId, algorithm } = req.body;
  if (!startNodeId || !endNodeId) {
    return res.status(400).json({ error: 'startNodeId and endNodeId are required.' });
  }

  const nodeIds = currentMap.nodes.map(n => n.id);
  if (!nodeIds.includes(startNodeId) || !nodeIds.includes(endNodeId)) {
    return res.status(404).json({ error: 'Start or end node not found in the graph.' });
  }

  if (algorithm === 'osrm') {
    const startNode = currentMap.nodes.find(n => n.id === startNodeId);
    const endNode = currentMap.nodes.find(n => n.id === endNodeId);
    try {
      const roadData = await getOSRMRoute(startNode, endNode);
      return res.json({
        algorithm: 'osrm',
        path: [startNodeId, endNodeId],
        pathEdges: [],
        totalCost: roadData.distance,
        geometry: roadData.geometry,
        visited: [startNodeId, endNodeId]
      });
    } catch (err) {
      console.warn('OSRM routing failed, falling back to traffic-aware Dijkstra:', err);
      const result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
      return res.json({
        algorithm: 'osrm-fallback',
        ...result,
        message: 'OSRM routing failed. Fell back to traffic-aware graph routing.'
      });
    }
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

// 5. GET all presets
router.get('/presets', (req, res) => {
  res.json(presets);
});

// 6. SAVE current map as a preset
router.post('/presets', (req, res) => {
  const { name, description, nodes, edges } = req.body;
  if (!name || !Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Name, nodes, and edges are required.' });
  }

  const newPreset = {
    id: 'preset-' + Math.random().toString(36).substring(2, 9),
    name,
    description: description || 'User-designed city network.',
    nodes,
    edges
  };

  presets.push(newPreset);
  res.json({ message: 'Template saved successfully', preset: newPreset });
});

// 7. DELETE custom preset
router.delete('/presets/:id', (req, res) => {
  const { id } = req.params;
  if (id === 'preset-manhattan') {
    return res.status(403).json({ error: 'Preloaded template cannot be removed.' });
  }

  const index = presets.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  presets.splice(index, 1);
  res.json({ message: 'Template deleted successfully', id });
});

module.exports = router;
