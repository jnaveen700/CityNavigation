import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap({
  nodes,
  edges,
  selectedNode,
  startNode,
  endNode,
  activeRoute,
  visitedNodes,
  mstEdges,
  mode, // 'select', 'add-node', 'add-edge', 'delete'
  simulationSpeed,
  onCanvasClick,
  onNodeSelect,
  onAddRoad,
  onDeleteNode,
  onDeleteEdge
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Group Layers for overlays
  const nodesGroupRef = useRef(L.layerGroup());
  const edgesGroupRef = useRef(L.layerGroup());
  const routeGroupRef = useRef(L.layerGroup());
  const vehiclesGroupRef = useRef(L.layerGroup());
  const searchGroupRef = useRef(L.layerGroup());

  const tempPolylineRef = useRef(null);
  
  // Refs for simulation loop
  const vehiclesRef = useRef([]); // { id, edgeId, progress, speed, color, direction, marker }
  const trafficLightsRef = useRef({}); // { nodeId: { color, timer, maxTimer } }
  const [edgeStartNode, setEdgeStartNode] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center in Downtown Manhattan, NY
    mapRef.current = L.map(mapContainerRef.current, {
      center: [40.719, -73.996],
      zoom: 14,
      zoomControl: false, // Turn off default controls to reduce clutter
      attributionControl: false
    });

    // Dark-themed tiles from CartoDB (perfect for neon visualizers)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(mapRef.current);

    // Add overlay groups to map
    edgesGroupRef.current.addTo(mapRef.current);
    routeGroupRef.current.addTo(mapRef.current);
    searchGroupRef.current.addTo(mapRef.current);
    vehiclesGroupRef.current.addTo(mapRef.current);
    nodesGroupRef.current.addTo(mapRef.current);

    // Initialize temporary drawing polyline
    tempPolylineRef.current = L.polyline([], {
      color: '#06b6d4',
      weight: 3,
      dashArray: '5, 8',
      opacity: 0.7
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map click handler depending on mode
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.off('click');
    mapRef.current.on('click', (e) => {
      if (mode === 'add-node') {
        onCanvasClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else {
        onNodeSelect(null);
        setEdgeStartNode(null);
        if (tempPolylineRef.current.map) {
          tempPolylineRef.current.remove();
        }
      }
    });

    // Track mouse movement for drawing roads
    mapRef.current.off('mousemove');
    mapRef.current.on('mousemove', (e) => {
      if (mode === 'add-edge' && edgeStartNode) {
        tempPolylineRef.current.setLatLngs([
          [edgeStartNode.lat, edgeStartNode.lng],
          [e.latlng.lat, e.latlng.lng]
        ]);
        if (!mapRef.current.hasLayer(tempPolylineRef.current)) {
          tempPolylineRef.current.addTo(mapRef.current);
        }
      } else {
        if (mapRef.current.hasLayer(tempPolylineRef.current)) {
          tempPolylineRef.current.remove();
        }
      }
    });
  }, [mode, edgeStartNode, onCanvasClick, onNodeSelect]);

  // Sync traffic light timers
  useEffect(() => {
    const lights = { ...trafficLightsRef.current };
    nodes.forEach(node => {
      if (!lights[node.id]) {
        lights[node.id] = {
          color: node.trafficLight || 'green',
          timer: (node.lightTimer || 5) * 20, // frames at 20fps sim
          maxTimer: (node.lightTimer || 5) * 20
        };
      }
    });
    trafficLightsRef.current = lights;
  }, [nodes]);

  // Render Edges (Roads)
  useEffect(() => {
    if (!mapRef.current) return;

    edgesGroupRef.current.clearLayers();

    const trafficColors = {
      'clear': '#10b981',      // green
      'moderate': '#f59e0b',   // orange
      'heavy': '#ef4444',      // red
      'jammed': '#881337'      // burgundy
    };

    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const dest = nodes.find(n => n.id === edge.target);
      if (!src || !dest) return;

      const isMst = mstEdges && mstEdges.some(me => me.id === edge.id);
      const roadColor = isMst ? '#06b6d4' : (trafficColors[edge.traffic] || '#475569');
      const roadWeight = isMst ? 6 : (edge.lanes * 2.5) + 1.5;

      const polyline = L.polyline([[src.lat, src.lng], [dest.lat, dest.lng]], {
        color: roadColor,
        weight: roadWeight,
        opacity: isMst ? 0.95 : 0.65,
        lineCap: 'round'
      });

      // Bind interactions
      polyline.on('mouseover', () => {
        polyline.setStyle({ color: '#f472b6', opacity: 0.95, weight: roadWeight + 2 });
      });

      polyline.on('mouseout', () => {
        polyline.setStyle({ color: roadColor, opacity: isMst ? 0.95 : 0.65, weight: roadWeight });
      });

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (mode === 'delete') {
          onDeleteEdge(edge.id);
        }
      });

      polyline.addTo(edgesGroupRef.current);
    });
  }, [nodes, edges, mstEdges, mode, onDeleteEdge]);

  // Render Nodes (Intersections) and Traffic Lights
  useEffect(() => {
    if (!mapRef.current) return;

    nodesGroupRef.current.clearLayers();

    nodes.forEach(node => {
      const isStart = startNode && startNode.id === node.id;
      const isEnd = endNode && endNode.id === node.id;
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isLinking = edgeStartNode && edgeStartNode.id === node.id;

      const lightState = trafficLightsRef.current[node.id] || { color: 'green' };

      const lightHex = lightState.color === 'green' ? '#10b981' : (lightState.color === 'yellow' ? '#f59e0b' : '#ef4444');

      let ringStyles = `border: 2px solid ${lightHex}; box-shadow: 0 0 6px ${lightHex};`;
      let coreClass = 'node-core';
      if (isStart) coreClass += ' start';
      else if (isEnd) coreClass += ' end';
      else if (isSelected) coreClass += ' selected';
      else if (isLinking) coreClass += ' selected';

      const html = `
        <div class="node-marker-container">
          <div class="node-traffic-light" style="${ringStyles}">
            <div class="${coreClass}"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-node-icon',
        html: html,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([node.lat, node.lng], { icon });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (mode === 'delete') {
          onDeleteNode(node.id);
        } else if (mode === 'add-edge') {
          if (!edgeStartNode) {
            setEdgeStartNode(node);
          } else {
            if (edgeStartNode.id !== node.id) {
              onAddRoad(edgeStartNode.id, node.id);
            }
            setEdgeStartNode(null);
            if (tempPolylineRef.current) {
              tempPolylineRef.current.setLatLngs([]);
            }
          }
        } else {
          onNodeSelect(node);
        }
      });

      marker.bindTooltip(node.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'node-map-tooltip'
      });

      marker.addTo(nodesGroupRef.current);
    });
  }, [nodes, startNode, endNode, selectedNode, edgeStartNode, mode, onNodeSelect, onDeleteNode, onAddRoad]);

  // Render Routes overlay
  useEffect(() => {
    if (!mapRef.current) return;

    routeGroupRef.current.clearLayers();

    if (activeRoute && activeRoute.pathEdges && activeRoute.pathEdges.length > 0) {
      const latlngs = [];

      activeRoute.path.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) latlngs.push([node.lat, node.lng]);
      });

      if (latlngs.length > 0) {
        L.polyline(latlngs, {
          color: '#a855f7',
          weight: 10,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(routeGroupRef.current);

        const routeCore = L.polyline(latlngs, {
          color: '#d8b4fe',
          weight: 4,
          opacity: 0.95,
          dashArray: '10, 15',
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(routeGroupRef.current);

        let dashOffset = 0;
        const animInterval = setInterval(() => {
          dashOffset = (dashOffset - 1) % 25;
          const el = routeCore.getElement();
          if (el) {
            el.style.strokeDashoffset = dashOffset + 'px';
          }
        }, 80);

        return () => clearInterval(animInterval);
      }
    }
  }, [activeRoute, nodes]);

  // Search animation
  useEffect(() => {
    if (!mapRef.current) return;
    searchGroupRef.current.clearLayers();

    if (visitedNodes && visitedNodes.length > 0) {
      let visitedIndex = 0;
      
      const interval = setInterval(() => {
        if (visitedIndex >= visitedNodes.length) {
          clearInterval(interval);
          return;
        }

        const nodeId = visitedNodes[visitedIndex];
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          L.circleMarker([node.lat, node.lng], {
            radius: 15,
            color: '#06b6d4',
            weight: 2,
            fillColor: '#06b6d4',
            fillOpacity: 0.1,
            className: 'pulse-map-circle'
          }).addTo(searchGroupRef.current);
        }

        visitedIndex++;
      }, 150 / (simulationSpeed || 1));

      return () => clearInterval(interval);
    }
  }, [visitedNodes, nodes, simulationSpeed]);

  // Vehicle Simulation Loops
  useEffect(() => {
    if (!mapRef.current) return;

    vehiclesGroupRef.current.clearLayers();
    vehiclesRef.current = [];

    if (edges.length === 0) return;

    const targetCount = Math.min(edges.length * 3, 30);
    const vehicleColors = ['#06b6d4', '#e11d48', '#fbbf24', '#a855f7', '#38bdf8', '#f472b6'];

    const initialVehicles = [];
    for (let i = 0; i < targetCount; i++) {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const srcNode = nodes.find(n => n.id === edge.source);
      const destNode = nodes.find(n => n.id === edge.target);
      if (!srcNode || !destNode) continue;

      const progress = Math.random();
      const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

      const vlat = srcNode.lat + (destNode.lat - srcNode.lat) * progress;
      const vlng = srcNode.lng + (destNode.lng - srcNode.lng) * progress;

      const vMarker = L.circleMarker([vlat, vlng], {
        radius: 4.5,
        color: color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 1.5,
        className: 'vehicle-glow-dot'
      }).addTo(vehiclesGroupRef.current);

      initialVehicles.push({
        id: Math.random().toString(36).substring(2, 9),
        edgeId: edge.id,
        progress: progress,
        speed: 0.005 + Math.random() * 0.008,
        color: color,
        direction: Math.random() > 0.5 ? 1 : -1,
        marker: vMarker
      });
    }

    vehiclesRef.current = initialVehicles;

    const simTimer = setInterval(() => {
      const speedMult = simulationSpeed;
      if (speedMult <= 0) return;

      Object.keys(trafficLightsRef.current).forEach(nodeId => {
        const light = trafficLightsRef.current[nodeId];
        light.timer -= 1;
        if (light.timer <= 0) {
          if (light.color === 'green') {
            light.color = 'yellow';
            light.timer = 40;
          } else if (light.color === 'yellow') {
            light.color = 'red';
            light.timer = light.maxTimer;
          } else {
            light.color = 'green';
            light.timer = light.maxTimer;
          }
        }
      });

      nodesGroupRef.current.eachLayer(marker => {
        const markerLatLng = marker.getLatLng();
        const node = nodes.find(n => Math.abs(n.lat - markerLatLng.lat) < 0.0001 && Math.abs(n.lng - markerLatLng.lng) < 0.0001);
        if (node) {
          const lightState = trafficLightsRef.current[node.id] || { color: 'green' };
          const lightHex = lightState.color === 'green' ? '#10b981' : (lightState.color === 'yellow' ? '#f59e0b' : '#ef4444');
          
          const el = marker.getElement();
          if (el) {
            const container = el.querySelector('.node-traffic-light');
            if (container) {
              container.style.borderColor = lightHex;
              container.style.boxShadow = `0 0 8px ${lightHex}`;
            }
          }
        }
      });

      const trafficMultipliers = { 'clear': 1.0, 'moderate': 0.6, 'heavy': 0.25, 'jammed': 0.04 };

      vehiclesRef.current.forEach(vehicle => {
        const edge = edges.find(e => e.id === vehicle.edgeId);
        if (!edge) return;

        const src = nodes.find(n => n.id === edge.source);
        const dest = nodes.find(n => n.id === edge.target);
        if (!src || !dest) return;

        const congestionMultiplier = trafficMultipliers[edge.traffic] || 1.0;
        const roadSpeedLimit = edge.speedLimit || 50;
        const lanes = edge.lanes || 2;
        
        const step = vehicle.speed * speedMult * congestionMultiplier * (roadSpeedLimit / 50) * (1 + (lanes - 1) * 0.1);

        const destNodeId = vehicle.direction === 1 ? edge.target : edge.source;
        const light = trafficLightsRef.current[destNodeId];

        const nextProgress = vehicle.progress + step;
        
        if (nextProgress >= 0.95 && vehicle.progress < 0.95) {
          if (light && light.color === 'red') {
            vehicle.progress = 0.95;
          } else if (light && light.color === 'yellow') {
            vehicle.progress += step * 0.35;
          } else {
            vehicle.progress = nextProgress;
          }
        } else if (nextProgress >= 1.0) {
          const connected = edges.filter(e => e.id !== edge.id && (e.source === destNodeId || e.target === destNodeId));
          if (connected.length > 0 && Math.random() > 0.15) {
            const nextEdge = connected[Math.floor(Math.random() * connected.length)];
            vehicle.edgeId = nextEdge.id;
            vehicle.progress = 0;
            vehicle.direction = nextEdge.source === destNodeId ? 1 : -1;
          } else {
            vehicle.progress = 0;
            vehicle.direction = vehicle.direction * -1;
          }
        } else {
          vehicle.progress = nextProgress;
        }

        const startPt = vehicle.direction === 1 ? src : dest;
        const endPt = vehicle.direction === 1 ? dest : src;

        const vlat = startPt.lat + (endPt.lat - startPt.lat) * vehicle.progress;
        const vlng = startPt.lng + (endPt.lng - startPt.lng) * vehicle.progress;

        vehicle.marker.setLatLng([vlat, vlng]);
      });

    }, 50);

    return () => {
      clearInterval(simTimer);
    };

  }, [edges, nodes, simulationSpeed]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      {/* MAP LAYER CONTAINMENT */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#040810'
        }}
      />
      
      {/* Floating Info Box */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          pointerEvents: 'none',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(10, 17, 32, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: mode === 'add-node' ? '#10b981' : (mode === 'add-edge' ? '#06b6d4' : (mode === 'delete' ? '#ef4444' : '#a855f7'))
          }}
        />
        <span style={{ color: '#94a3b8' }}>
          Mode: <strong style={{ color: '#f8fafc', textTransform: 'capitalize' }}>{mode.replace('-', ' ')}</strong>
        </span>
        {edgeStartNode && (
          <span style={{ color: '#64748b' }}>
            (Linking from {edgeStartNode.name})
          </span>
        )}
      </div>

      {/* FLOATING ZOOM AND RECENTER CONTROLS (Reduces Map Clutter, Easy adjustments) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={() => mapRef.current && mapRef.current.zoomIn()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(10, 17, 32, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(168,85,247,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
        >
          ＋
        </button>
        <button
          onClick={() => mapRef.current && mapRef.current.zoomOut()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(10, 17, 32, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(168,85,247,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
        >
          －
        </button>
        <button
          onClick={() => mapRef.current && mapRef.current.setView([40.719, -73.996], 14)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(10, 17, 32, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          title="Recenter Map"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(168,85,247,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'; }}
        >
          🎯
        </button>
      </div>
    </div>
  );
}
