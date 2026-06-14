import React from 'react';

export default function Legend() {
  const legendItems = [
    { label: 'Start Intersection', color: '#10b981', type: 'node' },
    { label: 'Destination Intersection', color: '#ef4444', type: 'node' },
    { label: 'Inspected Intersection', color: '#a855f7', type: 'node' },
    { label: 'Normal Flow (Clear)', color: 'rgba(16, 185, 129, 0.6)', type: 'road' },
    { label: 'Moderate Delays', color: 'rgba(245, 158, 11, 0.7)', type: 'road' },
    { label: 'Heavy Delays', color: 'rgba(239, 68, 68, 0.8)', type: 'road' },
    { label: 'Gridlock (Jammed)', color: 'rgba(136, 19, 55, 0.95)', type: 'road' },
    { label: 'Calculated Route', color: '#d8b4fe', type: 'path' },
    { label: 'Optimal Grid Backbone', color: '#06b6d4', type: 'mst' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', color: '#f8fafc' }}>
        Map Visual Guide
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px' }}>
        {legendItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {item.type === 'node' && (
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: item.color,
                boxShadow: `0 0 6px ${item.color}`
              }} />
            )}
            {item.type === 'road' && (
              <div style={{
                width: '24px',
                height: '5px',
                borderRadius: '2px',
                backgroundColor: item.color
              }} />
            )}
            {item.type === 'path' && (
              <div style={{
                width: '24px',
                height: '5px',
                borderRadius: '2px',
                backgroundColor: item.color,
                boxShadow: '0 0 8px #a855f7',
                border: '1px dashed #ffffff'
              }} />
            )}
            {item.type === 'mst' && (
              <div style={{
                width: '24px',
                height: '6px',
                borderRadius: '2px',
                backgroundColor: item.color,
                boxShadow: '0 0 6px #06b6d4'
              }} />
            )}
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
