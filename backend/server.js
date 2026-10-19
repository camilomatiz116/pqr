require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { dbGet, dbAll, dbRun, generateConsecutive } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_INVOICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_INVOICE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG o WEBP.'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(UPLOADS_DIR));

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Disproel PQR Backend is running.' });
});

// Centralized Auth Login (with dev mock fallback)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Attempt connection to the centralized authentication manager
  const authUrl = `${process.env.AUTH_SERVICE_URL || 'https://gestordeusuarios.disproel.com'}/api/login`;
  console.log(`Attempting login for ${username} at central server: ${authUrl}`);

  try {
    // Attempting live request
    const response = await axios.post(authUrl, { username, password }, { timeout: 3000 });
    return res.json(response.data);
  } catch (error) {
    console.log(`Centralized auth failed or unreachable. Falling back to local Mock Auth for development.`);
    
    // Developer fallback configuration (Mock Auth)
    // We enforce a specific general user to access the admin portal
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Autenticado mediante Mock Auth (Modo Desarrollo/Offline)',
        token: 'mock-jwt-token-disproel',
        user: {
          username: 'admin',
          name: 'Administrador General',
          role: 'comercial_dir' // Default role for the dashboard dropdown
        }
      });
    } else {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }
  }
});

// Create PQR (Client-facing)
app.post('/api/pqrs', (req, res, next) => {
  upload.single('factura_archivo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir el archivo de factura' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      fecha_solicitud,
      ciudad,
      nombre_razon_social,
      nit,
      nombre_contacto,
      direccion,
      barrio,
      telefono,
      email,
      asesor_comercial,
      fecha_compra,
      equipo_instalado,
      tiempo_trabajo,
      descripcion_falla
    } = req.body;

    // products arrives as a JSON string when sent via multipart/form-data
    let products = req.body.products;
    if (typeof products === 'string') {
      try {
        products = JSON.parse(products);
      } catch {
        products = [];
      }
    }

    const facturaArchivo = req.file ? req.file.filename : null;

    const consecutivo = await generateConsecutive();

    // Insert into pqrs
    const pqrResult = await dbRun(`
      INSERT INTO pqrs (
        consecutivo, fecha_solicitud, ciudad, nombre_razon_social, nit,
        nombre_contacto, direccion, barrio, telefono, email, asesor_comercial,
        fecha_compra, equipo_instalado, tiempo_trabajo, descripcion_falla, factura_archivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      consecutivo, fecha_solicitud, ciudad, nombre_razon_social, nit,
      nombre_contacto, direccion, barrio, telefono, email, asesor_comercial,
      fecha_compra, equipo_instalado, tiempo_trabajo, descripcion_falla, facturaArchivo
    ]);

    const pqrId = pqrResult.id;

    // Insert products if any
    if (products && Array.isArray(products)) {
      for (const prod of products) {
        const vr_unit = parseFloat(prod.vr_unit) || 0;
        const cantidad = parseInt(prod.cantidad) || 0;
        const vr_total = vr_unit * cantidad;

        await dbRun(`
          INSERT INTO pqr_products (
            pqr_id, codigo_producto, descripcion_producto, cantidad, factura, vr_unit, vr_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          pqrId, prod.codigo_producto, prod.descripcion_producto, cantidad, prod.factura, vr_unit, vr_total
        ]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'PQR creada exitosamente',
      pqrId,
      consecutivo
    });
  } catch (error) {
    console.error('Error creating PQR:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear PQR' });
  }
});

// Get all PQRs (Admin Dashboard)
app.get('/api/pqrs', async (req, res) => {
  try {
    const pqrs = await dbAll('SELECT * FROM pqrs ORDER BY id DESC');
    
    // Fetch products and approvals for each PQR to construct complete entities
    for (const pqr of pqrs) {
      pqr.products = await dbAll('SELECT * FROM pqr_products WHERE pqr_id = ?', [pqr.id]);
      pqr.approvals = await dbAll('SELECT * FROM pqr_approvals WHERE pqr_id = ?', [pqr.id]);
    }
    
    res.json(pqrs);
  } catch (error) {
    console.error('Error fetching PQRs:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar PQRs' });
  }
});

// Get single PQR details
app.get('/api/pqrs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pqr = await dbGet('SELECT * FROM pqrs WHERE id = ?', [id]);

    if (!pqr) {
      return res.status(404).json({ error: 'PQR no encontrada' });
    }

    pqr.products = await dbAll('SELECT * FROM pqr_products WHERE pqr_id = ?', [id]);
    pqr.approvals = await dbAll('SELECT * FROM pqr_approvals WHERE pqr_id = ?', [id]);

    res.json(pqr);
  } catch (error) {
    console.error('Error fetching PQR details:', error);
    res.status(500).json({ error: 'Error interno del servidor al buscar PQR' });
  }
});

// Sign/Submit approval step
app.put('/api/pqrs/:id/approvals', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, aprobado, firma_nombre, observaciones, fecha } = req.body;

    if (!rol || aprobado === undefined) {
      return res.status(400).json({ error: 'Rol y estado de aprobación son requeridos' });
    }

    // Insert or update approval
    await dbRun(`
      INSERT INTO pqr_approvals (pqr_id, rol, aprobado, fecha, firma_nombre, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(pqr_id, rol) DO UPDATE SET
        aprobado = excluded.aprobado,
        fecha = excluded.fecha,
        firma_nombre = excluded.firma_nombre,
        observaciones = excluded.observaciones
    `, [id, rol, aprobado ? 1 : 0, fecha, firma_nombre, observaciones]);

    // Update overall status of the PQR based on completed approvals
    // Let's retrieve all current approvals
    const approvals = await dbAll('SELECT * FROM pqr_approvals WHERE pqr_id = ?', [id]);
    const appMap = {};
    approvals.forEach(a => {
      appMap[a.rol] = a.aprobado === 1;
    });

    let newEstado = 'Pendiente';
    if (appMap['comercial_pre']) {
      newEstado = 'Preaprobado Comercial';
    }
    if (appMap['comercial_dir']) {
      newEstado = 'Aprobado Comercial';
    }
    if (appMap['calidad']) {
      newEstado = 'Recibido Calidad';
    }
    if (appMap['tecnica']) {
      newEstado = 'Evaluado Técnico / Completado';
    }

    await dbRun('UPDATE pqrs SET estado = ? WHERE id = ?', [newEstado, id]);

    res.json({
      success: true,
      message: 'Firma y estado de aprobación actualizados',
      estado: newEstado
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar aprobación' });
  }
});

// Update credit note value
app.put('/api/pqrs/:id/credit-note', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_nota_credito } = req.body;

    await dbRun('UPDATE pqrs SET valor_nota_credito = ? WHERE id = ?', [valor_nota_credito, id]);

    res.json({
      success: true,
      message: 'Valor de nota de crédito actualizado con éxito'
    });
  } catch (error) {
    console.error('Error updating credit note value:', error);
    res.status(500).json({ error: 'Error al actualizar valor de la nota de crédito' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
