import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, FileSignature, DollarSign, Calendar, Edit3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ApprovalPanel({ pqr, currentUser, onApprovalUpdated }) {
  const [loading, setLoading] = useState(false);
  const [creditValue, setCreditValue] = useState(pqr.valor_nota_credito || 0);
  const [updatingCredit, setUpdatingCredit] = useState(false);

  // Sign forms states
  const [signNames, setSignNames] = useState({
    comercial_pre: currentUser?.name || '',
    comercial_dir: currentUser?.name || '',
    calidad: currentUser?.name || '',
    tecnica: currentUser?.name || ''
  });
  
  const [signDates, setSignDates] = useState({
    comercial_pre: new Date().toISOString().split('T')[0],
    comercial_dir: new Date().toISOString().split('T')[0],
    calidad: new Date().toISOString().split('T')[0],
    tecnica: new Date().toISOString().split('T')[0]
  });

  const [signStatus, setSignStatus] = useState({
    comercial_pre: true,
    comercial_dir: true,
    calidad: true,
    tecnica: true
  });

  const [signObs, setSignObs] = useState({
    comercial_pre: '',
    comercial_dir: '',
    calidad: '',
    tecnica: ''
  });

  const getApproval = (role) => {
    return pqr.approvals?.find(a => a.rol === role) || null;
  };

  const handleSaveApproval = async (role) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/pqrs/${pqr.id}/approvals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: role,
          aprobado: signStatus[role],
          firma_nombre: signNames[role],
          observaciones: signObs[role],
          fecha: signDates[role]
        })
      });
      const data = await response.json();
      if (data.success) {
        onApprovalUpdated();
      }
    } catch (err) {
      alert('Error al guardar aprobación.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreditNote = async () => {
    setUpdatingCredit(true);
    try {
      const response = await fetch(`${API_URL}/api/pqrs/${pqr.id}/credit-note`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor_nota_credito: parseFloat(creditValue) || 0 })
      });
      const data = await response.json();
      if (data.success) {
        alert('Valor de la Nota de Crédito actualizado.');
        onApprovalUpdated();
      }
    } catch (err) {
      alert('Error al actualizar nota de crédito.');
      console.error(err);
    } finally {
      setUpdatingCredit(false);
    }
  };

  const renderApprovalSection = (role, label, description) => {
    const approval = getApproval(role);

    return (
      <div className="card" style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{label}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</p>
          </div>
          {approval ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: approval.aprobado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: approval.aprobado ? '#22c55e' : '#ef4444'
            }}>
              {approval.aprobado ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span>{approval.aprobado ? 'FIRMADO / APLICA' : 'RECHAZADO / NO APLICA'}</span>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(234, 88, 12, 0.1)',
              color: 'var(--secondary)'
            }}>
              <FileSignature size={14} />
              <span>PENDIENTE FIRMA</span>
            </div>
          )}
        </div>

        {approval ? (
          <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            <p><strong>Firmado por:</strong> {approval.firma_nombre}</p>
            <p><strong>Fecha:</strong> {approval.fecha}</p>
            {approval.observaciones && <p><strong>Observaciones:</strong> {approval.observaciones}</p>}
            <button 
              className="btn btn-outline" 
              style={{ marginTop: '0.75rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={async () => {
                if (window.confirm('¿Está seguro de eliminar esta firma?')) {
                  setLoading(true);
                  try {
                    await fetch(`${API_URL}/api/pqrs/${pqr.id}/approvals`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ rol: role, aprobado: false, firma_nombre: '', observaciones: '', fecha: '' })
                    });
                    onApprovalUpdated();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            >
              Remover Firma
            </button>
          </div>
        ) : (
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre del Firmante</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={signNames[role]} 
                  onChange={(e) => setSignNames(prev => ({ ...prev, [role]: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha Firma</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={signDates[role]} 
                  onChange={(e) => setSignDates(prev => ({ ...prev, [role]: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Estado de la Decisión</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={signStatus[role] === true} 
                    onChange={() => setSignStatus(prev => ({ ...prev, [role]: true }))} 
                  /> Aprobado / Aplica
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={signStatus[role] === false} 
                    onChange={() => setSignStatus(prev => ({ ...prev, [role]: false }))} 
                  /> Rechazado / No Aplica
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Observaciones / Dictamen</label>
              <textarea 
                className="form-input" 
                rows="2" 
                value={signObs[role]} 
                onChange={(e) => setSignObs(prev => ({ ...prev, [role]: e.target.value }))} 
                placeholder="Ingrese comentarios adicionales..."
              />
            </div>

            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem' }}
              disabled={loading || !signNames[role]}
              onClick={() => handleSaveApproval(role)}
            >
              Registrar Firma Oficial
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
        Flujo de Aprobación de Garantías
      </h3>

      {/* Credit Note Input Block */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05), rgba(37, 99, 235, 0.05))', borderColor: 'var(--border)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <DollarSign size={20} /> Liquidación de Nota de Crédito
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Defina el valor total de la Nota de Crédito autorizada para este cliente.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label">Valor Nota Crédito ($)</label>
            <input 
              type="number" 
              className="form-input" 
              value={creditValue} 
              onChange={(e) => setCreditValue(e.target.value)} 
              placeholder="0.00"
            />
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ height: '42px' }}
            disabled={updatingCredit}
            onClick={handleUpdateCreditNote}
          >
            Actualizar Valor
          </button>
        </div>
      </div>

      {/* Grid of Aprobaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {renderApprovalSection('comercial_pre', 'Preaprobación Comercial', 'Asesor Comercial firma para iniciar proceso')}
        {renderApprovalSection('comercial_dir', 'Aprobación Dirección', 'Dirección Comercial autoriza la nota')}
        {renderApprovalSection('calidad', 'Recepción de Material', 'Calidad certifica el estado del producto devuelto')}
        {renderApprovalSection('tecnica', 'Aval Técnico de Operaciones', 'Director de operaciones / I+D da viabilidad técnica')}
      </div>
    </div>
  );
}
