import React from 'react';
import { useERP } from '../../context/ERPContext';
import { Bus, MapPin, Phone, Users, Clock, ShieldCheck } from 'lucide-react';

export default function FleetTracker() {
  const { transport } = useERP();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Transport & Bus Fleet Operations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Transit routes, driver safety profiles, allocated stops, and fleet status monitoring.
          </p>
        </div>
      </div>

      {/* Route Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {transport.map((route) => (
          <div 
            key={route.routeId} 
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                    <Bus size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{route.routeName}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {route.routeId} • {route.busNumber}</span>
                  </div>
                </div>

                <span className="badge badge-success">
                  {route.status}
                </span>
              </div>

              {/* Transit Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DEPARTURE MORNING</span>
                  <strong>{route.departureMorning}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DEPARTURE EVENING</span>
                  <strong>{route.departureEvening}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PASSENGER OCCUPANCY</span>
                  <strong>{route.allocatedStudents} / {route.capacity} Seats</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DRIVER IN CHARGE</span>
                  <strong>{route.driverName}</strong>
                </div>
              </div>

              {/* Stops timeline */}
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                  Route Transit Waypoints
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '0.5rem' }}>
                  {route.stops.map((stop, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem' }}>
                      <MapPin size={13} color="var(--primary-light)" />
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-glass)' }}>
              <a 
                href={`tel:${route.driverPhone}`}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                <Phone size={13} />
                <span>Call Driver ({route.driverPhone})</span>
              </a>

              <span className="badge badge-primary">GPS Monitored</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
