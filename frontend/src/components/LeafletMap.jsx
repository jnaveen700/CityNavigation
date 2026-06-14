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
  onDeleteEdge,
  onNodeDrag,
  mapTheme,
  onToggleTheme,
  weather,
  activeEvent,
  incidentActive,
  raceState,
  setRaceState,
  globalGreenTime,
  globalRedTime,
  mapCenter,
  dashboardTheme,
  onToggleDashboardTheme
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

  // Prop refs to prevent simulation closure staleness
  const weatherRef = useRef(weather);
  const activeEventRef = useRef(activeEvent);
  const incidentActiveRef = useRef(incidentActive);
  const activeRouteRef = useRef(activeRoute);
  
  useEffect(() => { weatherRef.current = weather; }, [weather]);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);
  useEffect(() => { incidentActiveRef.current = incidentActive; }, [incidentActive]);
  useEffect(() => { activeRouteRef.current = activeRoute; }, [activeRoute]);

  // Convoy & battle animation tracking refs
  const vipProgressRef = useRef(0);
  const vipMarkerRef = useRef(null);

  const raceDijkstraProgress = useRef(0);
  const raceAstarProgress = useRef(0);
  const raceTrafficProgress = useRef(0);

  const raceDijkstraMarker = useRef(null);
  const raceAstarMarker = useRef(null);
  const raceTrafficMarker = useRef(null);

  const raceGeomDijkstra = useRef([]);
  const raceGeomAstar = useRef([]);
  const raceGeomTraffic = useRef([]);

  const tileLayerRef = useRef(null);

  // Dynamic tile switching effect based on mapTheme
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let tileUrl;
    if (mapTheme === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapTheme === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(mapRef.current);
  }, [mapTheme, isMapReady]);

  // Dynamic viewport centering based on active sector
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, 14, { animate: true, duration: 1.5 });
    }
  }, [mapCenter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center in selected city center
    mapRef.current = L.map(mapContainerRef.current, {
      center: mapCenter || [13.628, 79.419],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Add overlay groups to map
    edgesGroupRef.current.addTo(mapRef.current);
    routeGroupRef.current.addTo(mapRef.current);
    searchGroupRef.current.addTo(mapRef.current);
    vehiclesGroupRef.current.addTo(mapRef.current);
    nodesGroupRef.current.addTo(mapRef.current);

    // Initialize temporary drawing polyline
    tempPolylineRef.current = L.polyline([], {
      color: '#2563eb',
      weight: 3,
      dashArray: '5, 8',
      opacity: 0.7
    });

    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
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

  // Sync traffic light timers with sandbox overrides
  useEffect(() => {
    const lights = { ...trafficLightsRef.current };
    nodes.forEach(node => {
      const greenMax = globalGreenTime * 20;
      const redMax = globalRedTime * 20;
      if (!lights[node.id]) {
        lights[node.id] = {
          color: node.trafficLight || 'green',
          timer: node.trafficLight === 'red' ? redMax : greenMax,
          maxTimer: node.trafficLight === 'red' ? redMax : greenMax
        };
      } else {
        lights[node.id].maxTimer = lights[node.id].color === 'red' ? redMax : greenMax;
      }
    });
    trafficLightsRef.current = lights;
  }, [nodes, globalGreenTime, globalRedTime]);

  // Render Edges (Roads) using OSRM geometry
  useEffect(() => {
    if (!mapRef.current) return;

    edgesGroupRef.current.clearLayers();

    const trafficColors = mapTheme === 'satellite' ? {
      'clear': '#34d399',      // bright light emerald
      'moderate': '#fbbf24',   // bright amber
      'heavy': '#f87171',      // bright rose-red
      'jammed': '#f43f5e'      // bright rose
    } : {
      'clear': '#16a34a',      // green
      'moderate': '#f59e0b',   // orange
      'heavy': '#dc2626',      // red
      'jammed': '#991b1b'      // burgundy
    };

    const hasActiveRoute = activeRoute && (
      (activeRoute.pathEdges && activeRoute.pathEdges.length > 0) ||
      (activeRoute.geometry && activeRoute.geometry.length > 0)
    );

    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const dest = nodes.find(n => n.id === edge.target);
      if (!src || !dest) return;

      const isMst = mstEdges && mstEdges.some(me => me.id === edge.id);
      const isPartOfRoute = activeRoute && activeRoute.pathEdges && activeRoute.pathEdges.includes(edge.id);

      const roadColor = isMst ? '#475569' : (trafficColors[edge.traffic] || '#cbd5e1');
      const roadWeight = isMst ? 5 : (edge.lanes * 2.0) + 1.0;

      let roadOpacity = isMst ? 0.95 : 0.8;
      if (hasActiveRoute) {
        roadOpacity = isPartOfRoute ? 0.95 : 0.12;
      }

      // Draw using real OSRM street coordinates list if present, fallback to straight line
      const latlngs = (edge.geometry && edge.geometry.length > 0) 
        ? edge.geometry 
        : [[src.lat, src.lng], [dest.lat, dest.lng]];

      const polyline = L.polyline(latlngs, {
        color: roadColor,
        weight: roadWeight,
        opacity: roadOpacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Bind interactions
      polyline.on('mouseover', () => {
        if (!hasActiveRoute || isPartOfRoute) {
          polyline.setStyle({ color: '#f472b6', opacity: 0.95, weight: roadWeight + 2 });
        }
      });

      polyline.on('mouseout', () => {
        polyline.setStyle({ color: roadColor, opacity: roadOpacity, weight: roadWeight });
      });

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (mode === 'delete') {
          onDeleteEdge(edge.id);
        }
      });

      polyline.addTo(edgesGroupRef.current);
    });
  }, [nodes, edges, mstEdges, activeRoute, mode, onDeleteEdge]);

  // Render Nodes (Intersections)
  useEffect(() => {
    if (!mapRef.current) return;

    nodesGroupRef.current.clearLayers();

    const hasActiveRoute = activeRoute && activeRoute.path && activeRoute.path.length > 0;

    nodes.forEach(node => {
      const isStart = startNode && startNode.id === node.id;
      const isEnd = endNode && endNode.id === node.id;
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isLinking = edgeStartNode && edgeStartNode.id === node.id;
      const isPartOfRoute = activeRoute && activeRoute.path && activeRoute.path.includes(node.id);

      const lightState = trafficLightsRef.current[node.id] || { color: 'green' };
      const lightHex = lightState.color === 'green' ? '#16a34a' : (lightState.color === 'yellow' ? '#f59e0b' : '#dc2626');

      let nodeOpacity = 1.0;
      if (hasActiveRoute) {
        nodeOpacity = isPartOfRoute ? 1.0 : 0.25;
      }

      let ringStyles = `border: 2px solid ${lightHex};`;
      let coreClass = 'node-core';
      if (isStart) coreClass += ' start';
      else if (isEnd) coreClass += ' end';
      else if (isSelected) coreClass += ' selected';
      else if (isLinking) coreClass += ' selected';

      const html = `
        <div class="node-marker-container" style="opacity: ${nodeOpacity}">
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

      const isDraggable = !!(isStart || isEnd);
      const marker = L.marker([node.lat, node.lng], {
        icon,
        draggable: isDraggable
      });

      if (isDraggable) {
        marker.on('dragstart', (e) => {
          const el = e.target.getElement();
          if (el) {
            const innerNode = el.querySelector('.node-traffic-light');
            if (innerNode) {
              innerNode.classList.add('dragging-pin');
            }
          }
        });

        marker.on('dragend', (e) => {
          const el = e.target.getElement();
          if (el) {
            const innerNode = el.querySelector('.node-traffic-light');
            if (innerNode) {
              innerNode.classList.remove('dragging-pin');
            }
          }
          const newLatLng = e.target.getLatLng();
          if (onNodeDrag) {
            onNodeDrag(node.id, { lat: newLatLng.lat, lng: newLatLng.lng });
          }
        });
      }

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
  }, [nodes, startNode, endNode, selectedNode, edgeStartNode, activeRoute, mode, onNodeSelect, onDeleteNode, onAddRoad]);

  // Render Curved Routes overlay concatenating OSRM segments
  useEffect(() => {
    if (!mapRef.current) return;

    routeGroupRef.current.clearLayers();

    if (activeRoute) {
      let latlngs = [];

      if (activeRoute.geometry && activeRoute.geometry.length > 0) {
        latlngs = activeRoute.geometry;
      } else if (activeRoute.pathEdges && activeRoute.pathEdges.length > 0) {
        activeRoute.pathEdges.forEach(edgeId => {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            if (edge.geometry && edge.geometry.length > 0) {
              // Align geometries in coordinate sequence (source -> target order)
              const coords = [...edge.geometry];
              if (latlngs.length > 0) {
                const lastPt = latlngs[latlngs.length - 1];
                const distToFirst = Math.hypot(lastPt[0] - coords[0][0], lastPt[1] - coords[0][1]);
                const distToLast = Math.hypot(lastPt[0] - coords[coords.length - 1][0], lastPt[1] - coords[coords.length - 1][1]);
                if (distToLast < distToFirst) {
                  coords.reverse();
                }
              }
              latlngs.push(...coords);
            } else {
              const src = nodes.find(n => n.id === edge.source);
              const dest = nodes.find(n => n.id === edge.target);
              if (src && dest) {
                latlngs.push([src.lat, src.lng], [dest.lat, dest.lng]);
              }
            }
          }
        });
      }

      if (latlngs.length > 0) {
        // Underneath Layer: Thicker, clean white backing line
        L.polyline(latlngs, {
          color: '#ffffff',
          weight: 9,
          opacity: 1.0,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(routeGroupRef.current);

        // Top Layer: Solid blue foreground route line with active-route-flow className
        L.polyline(latlngs, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
          className: 'active-route-flow'
        }).addTo(routeGroupRef.current);
      }
    }
  }, [activeRoute, nodes, edges]);

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
            color: '#2563eb',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            className: 'pulse-map-circle'
          }).addTo(searchGroupRef.current);
        }

        visitedIndex++;
      }, 150 / (simulationSpeed || 1));

      return () => clearInterval(interval);
    }
  }, [visitedNodes, nodes, simulationSpeed]);

  const incidentMarkerRef = useRef(null);
  const festivalMarkerRef = useRef(null);

  // Sync custom event overlays (incident collision and street festival tent)
  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Incident Collision Marker
    if (incidentActive) {
      if (!incidentMarkerRef.current) {
        const icon = L.divIcon({
          className: 'incident-beacon',
          html: '<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;font-size:14px;pointer-events:none;">🚧</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const node = nodes.find(n => n.id === 'n2') || (nodes[1] ? { lat: nodes[1].lat, lng: nodes[1].lng } : { lat: 13.6465, lng: 79.4180 });
        incidentMarkerRef.current = L.marker([node.lat, node.lng], { icon })
          .bindTooltip("COLLISION ALERT: Kapila Theertham Junction blocked. Heavy delays.", { permanent: true, direction: 'right', className: 'node-map-tooltip' })
          .addTo(mapRef.current);
      }
    } else {
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
    }

    // 2. Chinatown Festival Marker
    if (activeEvent === 'festival') {
      if (!festivalMarkerRef.current) {
        const icon = L.divIcon({
          className: 'festival-lantern-glow',
          html: '<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;font-size:16px;pointer-events:none;">🎪</div>',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const node = nodes.find(n => n.id === 'n3') || (nodes[2] ? { lat: nodes[2].lat, lng: nodes[2].lng } : { lat: 13.6355, lng: 79.4260 });
        festivalMarkerRef.current = L.marker([node.lat, node.lng], { icon })
          .bindTooltip("Leela Mahal Circle Festival Closure", { permanent: true, direction: 'top', className: 'node-map-tooltip' })
          .addTo(mapRef.current);
      }
    } else {
      if (festivalMarkerRef.current) {
        festivalMarkerRef.current.remove();
        festivalMarkerRef.current = null;
      }
    }

    return () => {
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
      if (festivalMarkerRef.current) {
        festivalMarkerRef.current.remove();
        festivalMarkerRef.current = null;
      }
    };
  }, [incidentActive, activeEvent, nodes]);

  // Vehicle Simulation Loops (Steering along curved streets)
  useEffect(() => {
    if (!mapRef.current) return;

    vehiclesGroupRef.current.clearLayers();
    vehiclesRef.current = [];

    if (edges.length === 0) return;

    const targetCount = Math.min(edges.length * 3, 30);
    const vehicleColors = ['#3b82f6', '#475569', '#16a34a', '#dc2626', '#f59e0b'];

    const initialVehicles = [];
    for (let i = 0; i < targetCount; i++) {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const srcNode = nodes.find(n => n.id === edge.source);
      const destNode = nodes.find(n => n.id === edge.target);
      if (!srcNode || !destNode) continue;

      const progress = Math.random();
      const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

      const coordsList = (edge.geometry && edge.geometry.length > 0)
        ? edge.geometry
        : [[srcNode.lat, srcNode.lng], [destNode.lat, destNode.lng]];

      // Default spawn position
      const numSegments = coordsList.length - 1;
      const indexFloat = progress * numSegments;
      const index = Math.min(Math.floor(indexFloat), numSegments - 1);
      const segmentProgress = indexFloat - index;
      const startPt = coordsList[index];
      const endPt = coordsList[index + 1] || startPt;

      const vlat = startPt[0] + (endPt[0] - startPt[0]) * segmentProgress;
      const vlng = startPt[1] + (endPt[1] - startPt[1]) * segmentProgress;

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

      // Cycle traffic signals
      Object.keys(trafficLightsRef.current).forEach(nodeId => {
        const light = trafficLightsRef.current[nodeId];
        
        // VIP Convoy wave forces green light cycles along the active route
        if (activeEventRef.current === 'vip' && activeRouteRef.current && activeRouteRef.current.path && activeRouteRef.current.path.includes(nodeId)) {
          light.color = 'green';
          light.timer = light.maxTimer;
        } else {
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
        }
      });

      nodesGroupRef.current.eachLayer(marker => {
        const markerLatLng = marker.getLatLng();
        const node = nodes.find(n => Math.abs(n.lat - markerLatLng.lat) < 0.0001 && Math.abs(n.lng - markerLatLng.lng) < 0.0001);
        if (node) {
          const lightState = trafficLightsRef.current[node.id] || { color: 'green' };
          const lightHex = lightState.color === 'green' ? '#16a34a' : (lightState.color === 'yellow' ? '#f59e0b' : '#dc2626');
          
          const el = marker.getElement();
          if (el) {
            const container = el.querySelector('.node-traffic-light');
            if (container) {
              container.style.borderColor = lightHex;
              container.style.boxShadow = '';
            }
          }
        }
      });

      // VIP Convoy Limousine Escort Animation
      if (activeEventRef.current === 'vip' && activeRouteRef.current && activeRouteRef.current.geometry && activeRouteRef.current.geometry.length > 0) {
        vipProgressRef.current = (vipProgressRef.current + 0.003 * speedMult) % 1.0;
        
        const geom = activeRouteRef.current.geometry;
        const numSegs = geom.length - 1;
        const idxFloat = vipProgressRef.current * numSegs;
        const idx = Math.min(Math.floor(idxFloat), numSegs - 1);
        const segProgress = idxFloat - idx;
        const pStart = geom[idx];
        const pEnd = geom[idx + 1] || pStart;
        
        const vlat = pStart[0] + (pEnd[0] - pStart[0]) * segProgress;
        const vlng = pStart[1] + (pEnd[1] - pStart[1]) * segProgress;
        
        if (!vipMarkerRef.current && mapRef.current) {
          const icon = L.divIcon({
            className: 'vip-convoy-marker',
            html: '<div style="font-size:16px;animation:siren-pulse 0.4s infinite alternate;pointer-events:none;">🚔🖤🚔</div>',
            iconSize: [45, 20],
            iconAnchor: [22, 10]
          });
          vipMarkerRef.current = L.marker([vlat, vlng], { icon }).addTo(vehiclesGroupRef.current);
        } else if (vipMarkerRef.current) {
          vipMarkerRef.current.setLatLng([vlat, vlng]);
        }
      } else {
        if (vipMarkerRef.current) {
          vipMarkerRef.current.remove();
          vipMarkerRef.current = null;
          vipProgressRef.current = 0;
        }
      }

      // Dijkstra Pathfinder Algorithm Battle Helper
      function solvePath(startId, endId, considerTraffic) {
        const dist = {};
        const prev = {};
        const queue = new Set();
        
        nodes.forEach(n => {
          dist[n.id] = Infinity;
          prev[n.id] = null;
          queue.add(n.id);
        });
        dist[startId] = 0;
        
        while (queue.size > 0) {
          let minNode = null;
          queue.forEach(nodeId => {
            if (minNode === null || dist[nodeId] < dist[minNode]) {
              minNode = nodeId;
            }
          });
          
          if (minNode === endId || dist[minNode] === Infinity) break;
          queue.delete(minNode);
          
          const neighbors = edges.filter(e => e.source === minNode || e.target === minNode);
          neighbors.forEach(edge => {
            const neighborId = edge.source === minNode ? edge.target : edge.source;
            if (!queue.has(neighborId)) return;
            
            let weight = edge.distance || 300;
            if (considerTraffic) {
              const trafficMultipliers = { 'clear': 1.0, 'moderate': 1.5, 'heavy': 4.0, 'jammed': 25.0 };
              let mult = trafficMultipliers[edge.traffic] || 1.0;
              
              if (incidentActiveRef.current && edge.id === 'e2') {
                mult = 25.0; // Incident block Wall Street
              }
              if (activeEventRef.current === 'festival' && (edge.source === 'n3' || edge.target === 'n3')) {
                mult = 10.0; // Chinatown festival closure
              }
              weight = weight * mult;
            }
            
            const alt = dist[minNode] + weight;
            if (alt < dist[neighborId]) {
              dist[neighborId] = alt;
              prev[neighborId] = minNode;
            }
          });
        }
        
        const path = [];
        let curr = endId;
        while (curr !== null) {
          path.unshift(curr);
          curr = prev[curr];
        }
        return path[0] === startId ? path : [];
      }

      function getPathGeometry(path) {
        let coords = [];
        for (let i = 0; i < path.length - 1; i++) {
          const u = path[i];
          const v = path[i+1];
          const edge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
          if (edge) {
            const srcNode = nodes.find(n => n.id === edge.source);
            const destNode = nodes.find(n => n.id === edge.target);
            if (srcNode && destNode) {
              const edgeGeom = edge.geometry && edge.geometry.length > 0
                ? edge.geometry
                : [[srcNode.lat, srcNode.lng], [destNode.lat, destNode.lng]];
              
              const segment = [...edgeGeom];
              if (edge.source !== u) {
                segment.reverse();
              }
              coords.push(...segment);
            }
          }
        }
        return coords;
      }

      function interpolateCoords(coords, progress) {
        if (!coords || coords.length === 0) return null;
        if (coords.length === 1) return coords[0];
        if (progress <= 0) return coords[0];
        if (progress >= 1) return coords[coords.length - 1];
        
        const numSegs = coords.length - 1;
        const idxFloat = progress * numSegs;
        const idx = Math.floor(idxFloat);
        const segProgress = idxFloat - idx;
        const pStart = coords[idx];
        const pEnd = coords[idx + 1] || pStart;
        
        return [
          pStart[0] + (pEnd[0] - pStart[0]) * segProgress,
          pStart[1] + (pEnd[1] - pStart[1]) * segProgress
        ];
      }

      // Handle Map Algorithm Battle
      if (raceState === 'running') {
        if (raceGeomDijkstra.current.length === 0 && startNode && endNode) {
          const dPath = solvePath(startNode.id, endNode.id, false);
          const tPath = solvePath(startNode.id, endNode.id, true);
          const aPath = solvePath(startNode.id, endNode.id, false);

          raceGeomDijkstra.current = getPathGeometry(dPath);
          raceGeomTraffic.current = getPathGeometry(tPath);
          raceGeomAstar.current = getPathGeometry(aPath);

          raceDijkstraProgress.current = 0;
          raceAstarProgress.current = 0;
          raceTrafficProgress.current = 0;

          if (raceDijkstraMarker.current) raceDijkstraMarker.current.remove();
          if (raceAstarMarker.current) raceAstarMarker.current.remove();
          if (raceTrafficMarker.current) raceTrafficMarker.current.remove();

          raceDijkstraMarker.current = L.circleMarker(raceGeomDijkstra.current[0], { radius: 7, color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.95, weight: 2 }).addTo(vehiclesGroupRef.current).bindTooltip("Dijkstra", { permanent: true, direction: 'left', className: 'node-map-tooltip' });
          raceAstarMarker.current = L.circleMarker(raceGeomAstar.current[0], { radius: 7, color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.95, weight: 2 }).addTo(vehiclesGroupRef.current).bindTooltip("A* Search", { permanent: true, direction: 'right', className: 'node-map-tooltip' });
          raceTrafficMarker.current = L.circleMarker(raceGeomTraffic.current[0], { radius: 7, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.95, weight: 2 }).addTo(vehiclesGroupRef.current).bindTooltip("Traffic-Aware", { permanent: true, direction: 'top', className: 'node-map-tooltip' });
        }

        const stepVal = 0.006 * speedMult;

        // Dijkstra slows down on edge e2 if incident active
        if (raceDijkstraProgress.current < 1.0 && raceGeomDijkstra.current.length > 0) {
          const isAtWallStreet = incidentActiveRef.current && (raceDijkstraProgress.current > 0.35 && raceDijkstraProgress.current < 0.75);
          const factor = isAtWallStreet ? 0.03 : 1.0;
          raceDijkstraProgress.current = Math.min(1.0, raceDijkstraProgress.current + stepVal * factor);
          const pt = interpolateCoords(raceGeomDijkstra.current, raceDijkstraProgress.current);
          if (pt && raceDijkstraMarker.current) raceDijkstraMarker.current.setLatLng(pt);
        }

        // A* moves steadily
        if (raceAstarProgress.current < 1.0 && raceGeomAstar.current.length > 0) {
          raceAstarProgress.current = Math.min(1.0, raceAstarProgress.current + stepVal * 0.85);
          const pt = interpolateCoords(raceGeomAstar.current, raceAstarProgress.current);
          if (pt && raceAstarMarker.current) raceAstarMarker.current.setLatLng(pt);
        }

        // Traffic-Aware detours and sweeps to victory
        if (raceTrafficProgress.current < 1.0 && raceGeomTraffic.current.length > 0) {
          raceTrafficProgress.current = Math.min(1.0, raceTrafficProgress.current + stepVal * 1.15);
          const pt = interpolateCoords(raceGeomTraffic.current, raceTrafficProgress.current);
          if (pt && raceTrafficMarker.current) raceTrafficMarker.current.setLatLng(pt);
        }

        // Winner declared when Traffic-Aware finishes
        if (raceTrafficProgress.current >= 1.0 && raceDijkstraProgress.current < 1.0) {
          setRaceState('finished');
        }
      } else if (raceState === 'idle') {
        if (raceDijkstraMarker.current) { raceDijkstraMarker.current.remove(); raceDijkstraMarker.current = null; }
        if (raceAstarMarker.current) { raceAstarMarker.current.remove(); raceAstarMarker.current = null; }
        if (raceTrafficMarker.current) { raceTrafficMarker.current.remove(); raceTrafficMarker.current = null; }
        raceGeomDijkstra.current = [];
        raceGeomAstar.current = [];
        raceGeomTraffic.current = [];
      }

      const trafficMultipliers = { 'clear': 1.0, 'moderate': 0.6, 'heavy': 0.25, 'jammed': 0.04 };

      vehiclesRef.current.forEach(vehicle => {
        const edge = edges.find(e => e.id === vehicle.edgeId);
        if (!edge) return;

        const src = nodes.find(n => n.id === edge.source);
        const dest = nodes.find(n => n.id === edge.target);
        if (!src || !dest) return;

        let congestionMultiplier = trafficMultipliers[edge.traffic] || 1.0;

        // Apply event overrides (Chinatown festival blocks node n3, Incident blocks edge e2)
        if (activeEventRef.current === 'festival' && (edge.source === 'n3' || edge.target === 'n3')) {
          congestionMultiplier = 0.04;
        }
        if (incidentActiveRef.current && edge.id === 'e2') {
          congestionMultiplier = 0.04;
        }

        // Rainstorm slows vehicles by 30%
        const weatherMultiplier = weatherRef.current === 'rain' ? 0.7 : 1.0;

        const roadSpeedLimit = edge.speedLimit || 50;
        const lanes = edge.lanes || 2;
        
        const step = vehicle.speed * speedMult * congestionMultiplier * weatherMultiplier * (roadSpeedLimit / 50) * (1 + (lanes - 1) * 0.1);

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

        // Segment-by-segment interpolation along OSRM curve geometry
        const coordsList = (edge.geometry && edge.geometry.length > 0)
          ? edge.geometry
          : [[src.lat, src.lng], [dest.lat, dest.lng]];

        // Reverse coordinates if vehicle is moving in target -> source direction
        const list = vehicle.direction === -1 ? [...coordsList].reverse() : coordsList;

        const numSegments = list.length - 1;
        if (numSegments > 0) {
          const indexFloat = vehicle.progress * numSegments;
          const index = Math.min(Math.floor(indexFloat), numSegments - 1);
          const segmentProgress = indexFloat - index;

          const startPt = list[index];
          const endPt = list[index + 1] || startPt;

          const vlat = startPt[0] + (endPt[0] - startPt[0]) * segmentProgress;
          const vlng = startPt[1] + (endPt[1] - startPt[1]) * segmentProgress;

          vehicle.marker.setLatLng([vlat, vlng]);
        } else {
          vehicle.marker.setLatLng(list[0]);
        }
      });

    }, 50);

    return () => {
      clearInterval(simTimer);
    };

  }, [edges, nodes, simulationSpeed]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f8fafc'
        }}
      />
      
      {/* Rain Overlays */}
      {weather === 'rain' && <div className="rain-overlay" />}

      {/* GIS LAYER SELECTOR WIDGET */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 1000,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-clean)',
          borderRadius: '6px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        {[
          { id: 'light', label: 'Vector', icon: '🗺️' },
          { id: 'dark', label: 'Dark Ops', icon: '🌌' },
          { id: 'satellite', label: 'Satellite', icon: '🛰️' }
        ].map(layer => {
          const isActive = mapTheme === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => {
                onToggleTheme(layer.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                background: isActive ? 'var(--accent-dark)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Floating Info Box */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          pointerEvents: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          background: '#ffffff',
          border: '1px solid var(--border-clean)',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: mode === 'add-node' ? '#16a34a' : (mode === 'add-edge' ? '#2563eb' : (mode === 'delete' ? '#dc2626' : '#8b5cf6'))
          }}
        />
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Mode: <strong style={{ color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{mode.replace('-', ' ')}</strong>
        </span>
        {edgeStartNode && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
            (Linking from {edgeStartNode.name})
          </span>
        )}
      </div>

      {/* FLOATING ZOOM AND RECENTER CONTROLS */}
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
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid var(--border-clean)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = 'var(--border-clean)'; }}
        >
          ＋
        </button>
        <button
          onClick={() => mapRef.current && mapRef.current.zoomOut()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid var(--border-clean)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = 'var(--border-clean)'; }}
        >
          －
        </button>
        <button
          onClick={() => mapRef.current && mapRef.current.setView(mapCenter || [13.628, 79.419], 14)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid var(--border-clean)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          title="Recenter Map"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = 'var(--border-clean)'; }}
        >
          🎯
        </button>
        <button
          onClick={onToggleDashboardTheme}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-clean)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          title="Toggle Dashboard Theme"
        >
          {dashboardTheme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
