import React from 'react';

export default function PQRPrintView({ pqr }) {
  if (!pqr) return null;

  const totalSolicitud = pqr.products?.reduce((sum, prod) => sum + (prod.vr_total || 0), 0) || 0;

  // Find approval details
  const getApproval = (role) => {
    return pqr.approvals?.find(a => a.rol === role) || { aprobado: 0, firma_nombre: '', fecha: '', observaciones: '' };
  };

  const comercialPre = getApproval('comercial_pre');
  const comercialDir = getApproval('comercial_dir');
  const calidad = getApproval('calidad');
  const tecnica = getApproval('tecnica');

  return (
    <div className="print-only">
      {/* PAGE 1 */}
      <div className="print-page">
        {/* Header Block */}
        <table className="print-table" style={{ marginBottom: '15pt' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle', padding: '6pt' }}>
                <img src="/images/logo-disproel-azul.png" alt="Disproel" style={{ maxWidth: '140px', maxHeight: '50px', objectFit: 'contain' }} />
              </td>
              <td style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                FORMATO DE PQRS Y SOLICITUD DE GARANTÍAS
              </td>
              <td style={{ width: '25%', fontSize: '8pt' }}>
                <strong>Revisión No:</strong> 7<br />
                <strong>Página:</strong> 1 de 2
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: '7pt', textAlign: 'center' }}>
                Elaboró: Juan Pablo Ardila | Modificó: Myriam Orjuela | Aprobó: Gabriel Alfonso
              </td>
              <td style={{ fontSize: '7pt' }}>
                Fecha Rev: 03/03/2023
              </td>
            </tr>
          </tbody>
        </table>

        {/* Datos del solicitante */}
        <div className="print-sub-title" style={{ marginBottom: '5pt' }}>DATOS DEL SOLICITANTE</div>
        <table className="print-table" style={{ marginBottom: '10pt' }}>
          <tbody>
            <tr>
              <td className="print-header-cell" style={{ width: '15%' }}>Fecha Solicitud</td>
              <td style={{ width: '20%' }}>{pqr.fecha_solicitud}</td>
              <td className="print-header-cell" style={{ width: '10%' }}>Ciudad</td>
              <td style={{ width: '25%' }}>{pqr.ciudad}</td>
              <td className="print-header-cell" style={{ width: '15%' }}>Consecutivo</td>
              <td style={{ width: '15%', fontWeight: 'bold', color: '#1e40af' }}>{pqr.consecutivo}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Nombre / Razón Social</td>
              <td colSpan={5} style={{ fontWeight: 'bold' }}>{pqr.nombre_razon_social}</td>
            </tr>
            <tr>
              <td className="print-header-cell">NIT</td>
              <td colSpan={2}>{pqr.nit}</td>
              <td className="print-header-cell">Contacto</td>
              <td colSpan={2}>{pqr.nombre_contacto}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Dirección</td>
              <td colSpan={2}>{pqr.direccion}</td>
              <td className="print-header-cell">Barrio</td>
              <td colSpan={2}>{pqr.barrio}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Teléfono</td>
              <td>{pqr.telefono}</td>
              <td className="print-header-cell">Email</td>
              <td colSpan={3}>{pqr.email}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Asesor Comercial</td>
              <td colSpan={5}>{pqr.asesor_comercial}</td>
            </tr>
          </tbody>
        </table>

        {/* Tabla de productos */}
        <div className="print-sub-title" style={{ marginBottom: '5pt' }}>DETALLE DE LOS PRODUCTOS</div>
        <table className="print-table" style={{ marginBottom: '10pt' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ width: '15%', fontSize: '8pt', fontWeight: 'bold' }}>Código</th>
              <th style={{ width: '40%', fontSize: '8pt', fontWeight: 'bold' }}>Descripción</th>
              <th style={{ width: '10%', fontSize: '8pt', fontWeight: 'bold' }}>Cantidad</th>
              <th style={{ width: '15%', fontSize: '8pt', fontWeight: 'bold' }}>Factura</th>
              <th style={{ width: '10%', fontSize: '8pt', fontWeight: 'bold' }}>Vr. Unit ($)</th>
              <th style={{ width: '10%', fontSize: '8pt', fontWeight: 'bold' }}>Vr. Total ($)</th>
            </tr>
          </thead>
          <tbody>
            {pqr.products?.map((prod, idx) => (
              <tr key={idx}>
                <td>{prod.codigo_producto}</td>
                <td>{prod.descripcion_producto}</td>
                <td style={{ textAlign: 'center' }}>{prod.cantidad}</td>
                <td>{prod.factura}</td>
                <td style={{ textAlign: 'right' }}>${(prod.vr_unit || 0).toLocaleString()}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${(prod.vr_total || 0).toLocaleString()}</td>
              </tr>
            ))}
            {/* Fill empty rows to maintain layout if needed */}
            {Array.from({ length: Math.max(0, 3 - (pqr.products?.length || 0)) }).map((_, idx) => (
              <tr key={`empty-${idx}`} style={{ height: '22px' }}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '9pt' }}>Total Reclamado:</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '9pt', backgroundColor: '#f1f5f9' }}>
                ${totalSolicitud.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Información del producto e instalación */}
        <div className="print-sub-title" style={{ marginBottom: '5pt' }}>INFORMACIÓN DEL PRODUCTO</div>
        <table className="print-table" style={{ marginBottom: '15pt' }}>
          <tbody>
            <tr>
              <td className="print-header-cell" style={{ width: '25%' }}>Fecha de Compra:</td>
              <td>{pqr.fecha_compra}</td>
              <td className="print-header-cell" style={{ width: '25%' }}>Tiempo de Trabajo:</td>
              <td>{pqr.tiempo_trabajo}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Equipo Instalado:</td>
              <td colSpan={3}>{pqr.equipo_instalado}</td>
            </tr>
            <tr>
              <td className="print-header-cell">Descripción Falla o PQRS:</td>
              <td colSpan={3} style={{ height: '80px', verticalAlign: 'top' }}>
                {pqr.descripcion_falla}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Aprobación Nota Crédito */}
        <div className="print-sub-title" style={{ marginBottom: '5pt' }}>APROBACIÓN NOTA CRÉDITO (USO EXCLUSIVO DISPROEL)</div>
        <table className="print-table" style={{ marginBottom: '5pt' }}>
          <tbody>
            <tr>
              <td className="print-header-cell" style={{ width: '40%', fontSize: '10pt', fontWeight: 'bold' }}>VALOR NOTA CRÉDITO APROBADO:</td>
              <td style={{ fontSize: '12pt', fontWeight: 'bold', color: '#ea580c' }}>
                ${(pqr.valor_nota_credito || 0).toLocaleString()}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '8px', fontSize: '9pt', fontWeight: 'bold' }}>
                COMERCIAL <span style={{ border: '1px solid #000', display: 'inline-block', width: '12px', height: '12px', marginLeft: '5px', marginRight: '20px' }}></span>
                TECNICA <span style={{ border: '1px solid #000', display: 'inline-block', width: '12px', height: '12px', marginLeft: '5px', marginRight: '20px' }}></span>
                LOGISTICA <span style={{ border: '1px solid #000', display: 'inline-block', width: '12px', height: '12px', marginLeft: '5px' }}></span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Firmas y Aprobaciones */}
        <table className="print-table" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', padding: '0' }}>
                <div style={{ padding: '6px', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '8pt', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
                  ÁREA COMERCIAL
                </div>
                <div className="signature-box" style={{ borderRight: '1px solid #000' }}>
                  <div style={{ padding: '4px', fontSize: '8pt' }}>
                    {comercialPre.aprobado ? (
                      <div>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✓ PREAPROBADO</span><br />
                        <strong>Firma:</strong> {comercialPre.firma_nombre}<br />
                        <strong>Fecha:</strong> {comercialPre.fecha}
                      </div>
                    ) : (
                      <span style={{ color: 'gray' }}>Pendiente Preaprobación Asesor</span>
                    )}
                  </div>
                  <span className="signature-label">Preaprobación Asesor Comercial</span>
                </div>
                <div className="signature-box" style={{ borderRight: '1px solid #000', borderTop: '1px solid #000' }}>
                  <div style={{ padding: '4px', fontSize: '8pt' }}>
                    {comercialDir.aprobado ? (
                      <div>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✓ APROBADO</span><br />
                        <strong>Firma:</strong> {comercialDir.firma_nombre}<br />
                        <strong>Fecha:</strong> {comercialDir.fecha}
                      </div>
                    ) : (
                      <span style={{ color: 'gray' }}>Pendiente Aprobación Dirección</span>
                    )}
                  </div>
                  <span className="signature-label">Aprobación Dirección Comercial</span>
                </div>
              </td>
              <td style={{ width: '50%', padding: '0' }}>
                <div style={{ padding: '6px', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '8pt', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
                  TÉCNICA & CALIDAD (LOGÍSTICA)
                </div>
                <div className="signature-box">
                  <div style={{ padding: '4px', fontSize: '8pt' }}>
                    {calidad.aprobado ? (
                      <div>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✓ RECIBIDO</span><br />
                        <strong>Firma:</strong> {calidad.firma_nombre}<br />
                        <strong>Fecha:</strong> {calidad.fecha}
                      </div>
                    ) : (
                      <span style={{ color: 'gray' }}>Pendiente Recepción Material</span>
                    )}
                  </div>
                  <span className="signature-label">Recepción del Material: Fecha y Firma del Departamento de Calidad</span>
                </div>
                <div className="signature-box" style={{ borderTop: '1px solid #000' }}>
                  <div style={{ padding: '4px', fontSize: '8pt' }}>
                    {tecnica.aprobado ? (
                      <div>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✓ AVAL TÉCNICO REGISTRADO</span><br />
                        <strong>Aplica:</strong> Sí <br />
                        <strong>Firma:</strong> {tecnica.firma_nombre}<br />
                        <strong>Fecha:</strong> {tecnica.fecha}<br />
                        <strong>Dictamen:</strong> {tecnica.observaciones || 'Sin observaciones'}
                      </div>
                    ) : (
                      <span style={{ color: 'gray' }}>Pendiente Aval Técnico (Director/Ingeniero)<br /><br />Aplica _____  No Aplica _____</span>
                    )}
                  </div>
                  <span className="signature-label">Calificación de la Nota Crédito: Aval técnico (Director de operaciones o ingeniero de desarrollo)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PAGE 2 */}
      <div className="print-page">
        {/* Header Block Page 2 */}
        <table className="print-table" style={{ marginBottom: '15pt' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle', padding: '6pt' }}>
                <img src="/images/logo-disproel-azul.png" alt="Disproel" style={{ maxWidth: '140px', maxHeight: '50px', objectFit: 'contain' }} />
              </td>
              <td style={{ width: '50%', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                FORMATO DE PQRS Y SOLICITUD DE GARANTÍAS
              </td>
              <td style={{ width: '25%', fontSize: '8pt' }}>
                <strong>Revisión No:</strong> 7<br />
                <strong>Página:</strong> 2 de 2
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: '7pt', textAlign: 'center' }}>
                Elaboró: Juan Pablo Ardila | Modificó: Myriam Orjuela | Aprobó: Gabriel Alfonso
              </td>
              <td style={{ fontSize: '7pt' }}>
                Fecha Rev: 03/03/2023
              </td>
            </tr>
          </tbody>
        </table>

        {/* Nota Legal */}
        <div style={{ border: '2px solid #000', padding: '12pt', fontSize: '10pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '30pt', backgroundColor: '#f8fafc' }}>
          NOTA: En caso de que el producto evaluado no presente fallas, será enviado y facturado nuevamente al cliente.
        </div>

        {/* Tabla Control de Modificaciones */}
        <div className="print-sub-title" style={{ marginBottom: '5pt' }}>CONTROL DE MODIFICACIONES</div>
        <table className="print-table" style={{ fontSize: '8pt' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ width: '12%', fontWeight: 'bold' }}>Fecha</th>
              <th style={{ width: '8%', fontWeight: 'bold', textAlign: 'center' }}>Rev.</th>
              <th style={{ width: '45%', fontWeight: 'bold' }}>Ítems modificados</th>
              <th style={{ width: '35%', fontWeight: 'bold' }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>16-11-2011</td>
              <td style={{ textAlign: 'center' }}>0</td>
              <td>Se creó el formato</td>
              <td></td>
            </tr>
            <tr>
              <td>09-08-2013</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>Se Modificó el Formato en General</td>
              <td></td>
            </tr>
            <tr>
              <td>02/04/2014</td>
              <td style={{ textAlign: 'center' }}>2</td>
              <td>Número de campos de descripción de producto. Tamaño del campo de Descripción de la falla. Se elimina el campo de autorización del cliente y se define el campo de aprobación de Nota Crédito.</td>
              <td>Según la modificación del instructivo de manejo de garantías.</td>
            </tr>
            <tr>
              <td>21/04/2017</td>
              <td style={{ textAlign: 'center' }}>3</td>
              <td>Se adiciona campo consecutivo</td>
              <td></td>
            </tr>
            <tr>
              <td>18/01/2019</td>
              <td style={{ textAlign: 'center' }}>4</td>
              <td>Se adicionan campos: Asesor comercial, Valor unitario, valor total, Valor nota crédito</td>
              <td></td>
            </tr>
            <tr>
              <td>21/01/2022</td>
              <td style={{ textAlign: 'center' }}>5</td>
              <td>Se incluye aval técnico</td>
              <td>Y la evaluación de la garantías sea por el director de operaciones o ingeniero de desarrollo comercial.</td>
            </tr>
            <tr>
              <td>19/10/2022</td>
              <td style={{ textAlign: 'center' }}>6</td>
              <td>Se incluye aval técnico</td>
              <td>Y la evaluación de la garantías sea por el director de operaciones o Ingeniero de investigación y desarrollo.</td>
            </tr>
            <tr>
              <td>03/03/2023</td>
              <td style={{ textAlign: 'center' }}>7</td>
              <td>Se incluye una columna</td>
              <td>Para colocar el código del producto el cual solicitan la garantía y reclamación solicitud.</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Controlled Copy */}
        <div style={{ marginTop: '50pt', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', letterSpacing: '0.1em' }}>
          COPIA CONTROLADA
        </div>
      </div>
    </div>
  );
}
