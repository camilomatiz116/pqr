import React, { useState, useEffect } from 'react';
import { Search, LogOut, FileText, Printer, ChevronRight, UserCheck, ShieldAlert, Award } from 'lucide-react';
import ApprovalPanel from './ApprovalPanel';
import PQRPrintView from './PQRPrintView';

export default function AdminDashboard({ currentUser, onLogout }) {
  const [pqrs, setPqrs] = useState([]);
  const [selectedPqr, setSelectedPqr] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(currentUser?.role || 'comercial_pre');

  const fetchPQRs = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/pqrs`);
      const data = await response.json();
      setPqrs(data);
      // Update selected PQR if active
      if (selectedPqr) {
        const updated = data.find(p => p.id === selectedPqr.id);
        if (updated) setSelectedPqr(updated);
      }
    } catch (err) {
      console.error('Error fetching PQRs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPQRs();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Filter logic
  const filteredPqrs = pqrs.filter(pqr => {
    const matchesSearch = 
      pqr.nombre_razon_social?.toLowerCase().includes(search.toLowerCase()) ||
      pqr.nit?.toLowerCase().includes(search.toLowerCase()) ||
      pqr.consecutivo?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || pqr.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return { bg: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' };
      case 'Preaprobado Comercial': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'Aprobado Comercial': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'Recibido Calidad': return { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' };
      case 'Evaluado Técnico / Completado': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      default: return { bg: '#e2e8f0', color: '#64748b' };
    }
  };

  return (
    <div className="no-print" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>gestordepqrs.disproel.com</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Módulo Administrativo e Interno</p>
          </div>
        </div>

        {/* User profile & Role switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rol de Pruebas:</span>
            <select 
              value={activeRole} 
              onChange={(e) => setActiveRole(e.target.value)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}
            >
              <option value="comercial_pre">Asesor Comercial</option>
              <option value="comercial_dir">Dirección Comercial</option>
              <option value="calidad">Dpto de Calidad</option>
              <option value="tecnica">Director Operaciones</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, display: 'block' }}>{currentUser?.name || 'Administrador'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.username || 'admin'}</span>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={onLogout} title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar List */}
        <aside style={{
          width: '380px',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search and Filters */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por cliente, consecutivo o NIT..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {['All', 'Pendiente', 'Preaprobado Comercial', 'Aprobado Comercial', 'Recibido Calidad', 'Evaluado Técnico / Completado'].map(status => {
                const label = status === 'All' ? 'Todos' : status.split(' ')[0];
                const active = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredPqrs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No se encontraron solicitudes.
              </div>
            ) : (
              filteredPqrs.map(pqr => {
                const colors = getStatusColor(pqr.estado);
                const isSelected = selectedPqr && selectedPqr.id === pqr.id;
                return (
                  <div
                    key={pqr.id}
                    onClick={() => setSelectedPqr(pqr)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      background: isSelected ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary)' }}>{pqr.consecutivo}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pqr.fecha_solicitud}</span>
                      </div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                        {pqr.nombre_razon_social}
                      </h4>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: colors.bg,
                        color: colors.color,
                        marginTop: '0.5rem'
                      }}>
                        {pqr.estado}
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Detail Pane */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg-app)' }}>
          {selectedPqr ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
              
              {/* Detail Header */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {selectedPqr.consecutivo}
                    </span>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: getStatusColor(selectedPqr.estado).bg,
                      color: getStatusColor(selectedPqr.estado).color
                    }}>
                      {selectedPqr.estado}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Registrado el {selectedPqr.created_at} | Ciudad: {selectedPqr.ciudad}
                  </p>
                </div>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Imprimir Formato (PDF)
                </button>
              </div>

              {/* Grid General & Products */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {/* Solicitante Card */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Información del Cliente
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <p><strong>Razón Social:</strong><br /> {selectedPqr.nombre_razon_social}</p>
                    <p><strong>NIT:</strong><br /> {selectedPqr.nit}</p>
                    <p><strong>Contacto:</strong><br /> {selectedPqr.nombre_contacto}</p>
                    <p><strong>Teléfono:</strong><br /> {selectedPqr.telefono}</p>
                    <p><strong>Dirección:</strong><br /> {selectedPqr.direccion} ({selectedPqr.barrio})</p>
                    <p><strong>Email:</strong><br /> {selectedPqr.email}</p>
                    <p style={{ gridColumn: 'span 2' }}><strong>Asesor Comercial:</strong><br /> {selectedPqr.asesor_comercial}</p>
                  </div>
                </div>

                {/* Garantia Card */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Datos del Equipo e Instalación
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <p><strong>Fecha Compra:</strong><br /> {selectedPqr.fecha_compra}</p>
                    <p><strong>Tiempo Trabajo:</strong><br /> {selectedPqr.tiempo_trabajo}</p>
                    <p style={{ gridColumn: 'span 2' }}><strong>Equipo de Instalación:</strong><br /> {selectedPqr.equipo_instalado}</p>
                  </div>
                  <div>
                    <strong>Descripción de la Falla:</strong>
                    <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                      {selectedPqr.descripcion_falla}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table Card */}
              <div className="card">
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                  Ítems Reclamados
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>Código</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>Descripción</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', textAlign: 'center' }}>Cantidad</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>Factura</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', textAlign: 'right' }}>Valor Unitario</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', textAlign: 'right' }}>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPqr.products?.map((prod, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{prod.codigo_producto}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{prod.descripcion_producto}</td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{prod.cantidad}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{prod.factura}</td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>${(prod.vr_unit || 0).toLocaleString()}</td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>${(prod.vr_total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Module */}
              <ApprovalPanel 
                pqr={selectedPqr} 
                currentUser={{
                  name: currentUser?.name || 'Administrador',
                  role: activeRole
                }} 
                onApprovalUpdated={fetchPQRs}
              />

              {/* Hidden Print Layout */}
              <PQRPrintView pqr={selectedPqr} />

            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              color: 'var(--text-muted)'
            }}>
              <FileText size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>Selecciona una PQR del panel izquierdo para ver el detalle y gestionar firmas.</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
