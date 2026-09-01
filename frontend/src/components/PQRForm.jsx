import React, { useState } from 'react';
import { Plus, Trash2, Send, CheckCircle2, Package, User, FileText } from 'lucide-react';

export default function PQRForm() {
  const [submitted, setSubmitted] = useState(false);
  const [consecutivo, setConsecutivo] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fecha_solicitud: new Date().toISOString().split('T')[0],
    ciudad: '',
    nombre_razon_social: '',
    nit: '',
    nombre_contacto: '',
    direccion: '',
    barrio: '',
    telefono: '',
    email: '',
    asesor_comercial: '',
    fecha_compra: '',
    equipo_instalado: '',
    tiempo_trabajo: '',
    descripcion_falla: ''
  });

  const [products, setProducts] = useState([
    { codigo_producto: '', descripcion_producto: '', cantidad: 1, factura: '', vr_unit: 0 }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProductRow = () => {
    setProducts(prev => [...prev, { codigo_producto: '', descripcion_producto: '', cantidad: 1, factura: '', vr_unit: 0 }]);
  };

  const removeProductRow = (index) => {
    if (products.length === 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = (prod) => {
    return (prod.cantidad || 0) * (prod.vr_unit || 0);
  };

  const calculateGrandTotal = () => {
    return products.reduce((acc, p) => acc + calculateTotal(p), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/pqrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, products })
      });
      const data = await response.json();
      if (data.success) {
        setConsecutivo(data.consecutivo);
        setSubmitted(true);
      }
    } catch (err) {
      alert('Error al enviar la solicitud de PQR. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '650px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }} className="card">
        <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'inline-block' }}>
          <CheckCircle2 size={64} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Solicitud Recibida</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
          Tu solicitud de PQR y Garantía ha sido guardada en nuestro sistema Disproel.
        </p>
        <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Consecutivo PQR
          </span>
          <strong style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{consecutivo}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setSubmitted(false);
          setProducts([{ codigo_producto: '', descripcion_producto: '', cantidad: 1, factura: '', vr_unit: 0 }]);
          setFormData({
            fecha_solicitud: new Date().toISOString().split('T')[0],
            ciudad: '',
            nombre_razon_social: '',
            nit: '',
            nombre_contacto: '',
            direccion: '',
            barrio: '',
            telefono: '',
            email: '',
            asesor_comercial: '',
            fecha_compra: '',
            equipo_instalado: '',
            tiempo_trabajo: '',
            descripcion_falla: ''
          });
        }}>
          Crear Nueva Solicitud
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Form Header */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={32} /> FORMATO DE PQRS Y GARANTÍAS
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Disproel S.A.S. - Gestión de Devoluciones y Reclamaciones
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="form-label" style={{ display: 'block' }}>Fecha Solicitud</span>
            <input 
              type="date" 
              name="fecha_solicitud" 
              className="form-input" 
              value={formData.fecha_solicitud} 
              onChange={handleInputChange} 
              style={{ maxWidth: '180px' }}
            />
          </div>
        </div>

        {/* Section 1: Datos del solicitante */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} /> 1. Datos del Solicitante
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Nombre o Razón social (como aparece en factura)</label>
              <input type="text" name="nombre_razon_social" className="form-input" value={formData.nombre_razon_social} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">NIT / Cédula</label>
              <input type="text" name="nit" className="form-input" value={formData.nit} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input type="text" name="ciudad" className="form-input" value={formData.ciudad} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del Contacto</label>
              <input type="text" name="nombre_contacto" className="form-input" value={formData.nombre_contacto} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input type="text" name="direccion" className="form-input" value={formData.direccion} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Barrio</label>
              <input type="text" name="barrio" className="form-input" value={formData.barrio} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="text" name="telefono" className="form-input" value={formData.telefono} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Asesor Comercial</label>
              <input type="text" name="asesor_comercial" className="form-input" value={formData.asesor_comercial} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        {/* Section 2: Productos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} /> 2. Detalle de los Productos
            </h3>
            <button type="button" className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }} onClick={addProductRow}>
              <Plus size={16} /> Agregar Producto
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>CÓDIGO</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', width: '35%' }}>DESCRIPCIÓN</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>CANTIDAD</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>FACTURA</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>VR. UNIT ($)</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ($)</th>
                  <th style={{ padding: '0.75rem', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="text" className="form-input" value={prod.codigo_producto} onChange={(e) => handleProductChange(idx, 'codigo_producto', e.target.value)} required />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="text" className="form-input" value={prod.descripcion_producto} onChange={(e) => handleProductChange(idx, 'descripcion_producto', e.target.value)} required />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="number" className="form-input" min="1" value={prod.cantidad} onChange={(e) => handleProductChange(idx, 'cantidad', parseInt(e.target.value) || 0)} required />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="text" className="form-input" value={prod.factura} onChange={(e) => handleProductChange(idx, 'factura', e.target.value)} required />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input type="number" className="form-input" min="0" step="0.01" value={prod.vr_unit} onChange={(e) => handleProductChange(idx, 'vr_unit', parseFloat(e.target.value) || 0)} required />
                    </td>
                    <td style={{ padding: '0.5rem 1rem', fontWeight: '600' }}>
                      ${calculateTotal(prod).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button type="button" onClick={() => removeProductRow(idx)} disabled={products.length === 1} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: products.length === 1 ? 0.3 : 1 }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingRight: '1rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              Valor Total Solicitud: <span style={{ color: 'var(--primary)' }}>${calculateGrandTotal().toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Section 3: Información de Garantía y Falla */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            3. Información del Producto e Instalación
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Compra</label>
              <input type="date" name="fecha_compra" className="form-input" value={formData.fecha_compra} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Equipo en el que se instaló el Producto</label>
              <input type="text" name="equipo_instalado" className="form-input" placeholder="Ej: Tablero de Distribución" value={formData.equipo_instalado} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tiempo de trabajo del producto</label>
              <input type="text" name="tiempo_trabajo" className="form-input" placeholder="Ej: 3 meses, 48 horas" value={formData.tiempo_trabajo} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción de la falla o motivo de la PQR</label>
            <textarea 
              name="descripcion_falla" 
              className="form-input" 
              rows="4" 
              style={{ resize: 'vertical' }} 
              placeholder="Describa de manera detallada por qué realiza la devolución o garantía..."
              value={formData.descripcion_falla} 
              onChange={handleInputChange} 
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={loading}>
            <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Solicitud de PQR'}
          </button>
        </div>
      </form>
    </div>
  );
}
