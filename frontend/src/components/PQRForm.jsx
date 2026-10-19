import React, { useState } from 'react';
import { Plus, Trash2, Send, CheckCircle2, Package, User, FileText, Paperclip, X, ArrowLeft, ClipboardCheck } from 'lucide-react';

const MAX_FACTURA_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FACTURA_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const SOLICITANTE_FIELDS = [
  { key: 'nombre_razon_social', label: 'Nombre o Razón Social' },
  { key: 'nit', label: 'NIT / Cédula' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'nombre_contacto', label: 'Nombre del Contacto' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'barrio', label: 'Barrio' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Correo Electrónico' },
  { key: 'asesor_comercial', label: 'Asesor Comercial' }
];

const PRODUCTO_FIELDS = [
  { key: 'fecha_compra', label: 'Fecha de Compra' },
  { key: 'equipo_instalado', label: 'Equipo en el que se instaló' },
  { key: 'tiempo_trabajo', label: 'Tiempo de Trabajo' }
];

export default function PQRForm() {
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [consecutivo, setConsecutivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [facturaArchivo, setFacturaArchivo] = useState(null);
  const [facturaError, setFacturaError] = useState('');

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

  const handleFacturaChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFacturaArchivo(null);
      setFacturaError('');
      return;
    }
    if (!ALLOWED_FACTURA_TYPES.includes(file.type)) {
      setFacturaError('Formato no permitido. Sube un PDF, JPG, PNG o WEBP.');
      setFacturaArchivo(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FACTURA_SIZE) {
      setFacturaError('El archivo supera el tamaño máximo de 10 MB.');
      setFacturaArchivo(null);
      e.target.value = '';
      return;
    }
    setFacturaError('');
    setFacturaArchivo(file);
  };

  // Native HTML5 validation already ran when this submit fires; move to the review screen.
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setShowReview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => body.append(key, value));
      body.append('products', JSON.stringify(products));
      if (facturaArchivo) {
        body.append('factura_archivo', facturaArchivo);
      }

      const response = await fetch(`${API_URL}/api/pqrs`, {
        method: 'POST',
        body
      });
      const data = await response.json();
      if (data.success) {
        setConsecutivo(data.consecutivo);
        setShowReview(false);
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
          setShowReview(false);
          setProducts([{ codigo_producto: '', descripcion_producto: '', cantidad: 1, factura: '', vr_unit: 0 }]);
          setFacturaArchivo(null);
          setFacturaError('');
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

  if (showReview) {
    return (
      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Review Header */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={32} /> Revisa tu Solicitud
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Verifica que los datos sean correctos antes de enviar. Si necesitas corregir algo, vuelve a editar.
            </p>
          </div>

          {/* Datos del solicitante */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Datos del Solicitante
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha Solicitud</span>
                <strong>{formData.fecha_solicitud || '-'}</strong>
              </div>
              {SOLICITANTE_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <strong>{formData[key] || '-'}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} /> Detalle de los Productos
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>CÓDIGO</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>CANTIDAD</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>FACTURA</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>VR. UNIT ($)</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{prod.codigo_producto || '-'}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{prod.descripcion_producto || '-'}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{prod.cantidad}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{prod.factura || '-'}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>${(prod.vr_unit || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>${calculateTotal(prod).toLocaleString()}</td>
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

          {/* Factura adjunta */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paperclip size={20} /> Factura de Venta Adjunta
            </h3>
            <p style={{ fontSize: '0.875rem', color: facturaArchivo ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {facturaArchivo ? `${facturaArchivo.name} (${(facturaArchivo.size / 1024).toFixed(0)} KB)` : 'No se adjuntó ningún archivo.'}
            </p>
          </div>

          {/* Información del producto e instalación */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Información del Producto e Instalación
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {PRODUCTO_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <strong>{formData[key] || '-'}</strong>
                </div>
              ))}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                Descripción de la Falla
              </span>
              <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {formData.descripcion_falla || '-'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowReview(false)} disabled={loading}>
              <ArrowLeft size={18} /> Volver a Editar
            </button>
            <button type="button" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={handleConfirmSubmit} disabled={loading}>
              <Send size={18} /> {loading ? 'Enviando...' : 'Confirmar y Enviar Solicitud'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <form onSubmit={handleReviewSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Form Header */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={32} /> FORMATO DE PQRS Y GARANTÍAS
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Disproel S.A. - Gestión de Devoluciones y Reclamaciones
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

          {/* Adjuntar factura de venta */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Paperclip size={16} /> Adjuntar Factura de Venta (PDF, JPG, PNG o WEBP - máx. 10MB)
            </label>
            <input
              type="file"
              className="form-input"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={handleFacturaChange}
            />
            {facturaError && (
              <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{facturaError}</p>
            )}
            {facturaArchivo && !facturaError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>{facturaArchivo.name} ({(facturaArchivo.size / 1024).toFixed(0)} KB)</span>
                <button
                  type="button"
                  onClick={() => setFacturaArchivo(null)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                  title="Quitar archivo"
                >
                  <X size={16} />
                </button>
              </div>
            )}
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
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <ClipboardCheck size={18} /> Revisar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
}
