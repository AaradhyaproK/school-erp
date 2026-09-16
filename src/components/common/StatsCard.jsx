import React from 'react';

export default function StatsCard({ title, value, subtext, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: {
      border: 'rgba(99, 102, 241, 0.25)',
      glow: 'rgba(99, 102, 241, 0.15)',
      text: 'var(--primary-light)',
      bgIcon: 'rgba(99, 102, 241, 0.12)'
    },
    success: {
      border: 'rgba(16, 185, 129, 0.25)',
      glow: 'rgba(16, 185, 129, 0.15)',
      text: 'var(--success)',
      bgIcon: 'var(--success-bg)'
    },
    warning: {
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'rgba(245, 158, 11, 0.15)',
      text: 'var(--warning)',
      bgIcon: 'var(--warning-bg)'
    },
    purple: {
      border: 'rgba(168, 85, 247, 0.25)',
      glow: 'rgba(168, 85, 247, 0.15)',
      text: 'var(--purple)',
      bgIcon: 'var(--purple-bg)'
    }
  };

  const current = colorMap[color] || colorMap.primary;

  return (
    <div 
      className="glass-panel glass-panel-hover stats-card-container"
      style={{
        padding: '1.15rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${current.text}`
      }}
    >
      <div style={{ zIndex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {value}
          </h3>
          {trend && (
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
              display: 'inline-flex',
              alignItems: 'center',
              background: trend.startsWith('+') ? 'var(--success-bg)' : 'var(--danger-bg)',
              padding: '0.12rem 0.4rem',
              borderRadius: 'var(--radius-full)'
            }}>
              {trend}
            </span>
          )}
        </div>
        {subtext && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtext}
          </p>
        )}
      </div>

      {Icon && (
        <div 
          className="stats-card-icon"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: current.bgIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: current.text,
            border: `1px solid ${current.border}`,
            boxShadow: `0 0 16px ${current.glow}`,
            flexShrink: 0
          }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
}
