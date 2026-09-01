const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'pqrs.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database tables
db.serialize(() => {
  // Table for PQR details
  db.run(`
    CREATE TABLE IF NOT EXISTS pqrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consecutivo TEXT UNIQUE NOT NULL,
      fecha_solicitud TEXT,
      ciudad TEXT,
      nombre_razon_social TEXT,
      nit TEXT,
      nombre_contacto TEXT,
      direccion TEXT,
      barrio TEXT,
      telefono TEXT,
      email TEXT,
      asesor_comercial TEXT,
      fecha_compra TEXT,
      equipo_instalado TEXT,
      tiempo_trabajo TEXT,
      descripcion_falla TEXT,
      valor_nota_credito REAL DEFAULT 0.0,
      estado TEXT DEFAULT 'Pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table for PQR products
  db.run(`
    CREATE TABLE IF NOT EXISTS pqr_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pqr_id INTEGER NOT NULL,
      codigo_producto TEXT,
      descripcion_producto TEXT,
      cantidad INTEGER,
      factura TEXT,
      vr_unit REAL,
      vr_total REAL,
      FOREIGN KEY (pqr_id) REFERENCES pqrs (id) ON DELETE CASCADE
    )
  `);

  // Table for PQR approvals (Comercial pre-approval, Comercial approval, Calidad, Técnica)
  db.run(`
    CREATE TABLE IF NOT EXISTS pqr_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pqr_id INTEGER NOT NULL,
      rol TEXT NOT NULL,
      aprobado INTEGER NOT NULL,
      fecha TEXT,
      firma_nombre TEXT,
      observaciones TEXT,
      UNIQUE(pqr_id, rol),
      FOREIGN KEY (pqr_id) REFERENCES pqrs (id) ON DELETE CASCADE
    )
  `);
});

// Helper functions for DB queries wrapped in Promises
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Generate next consecutive PQR code (e.g. PQR 16795)
const generateConsecutive = async () => {
  const row = await dbGet("SELECT MAX(id) as maxId FROM pqrs");
  const nextId = (row && row.maxId ? row.maxId : 0) + 16790; // Start at 16790 matching the PDF format
  return `PQR ${nextId}`;
};

module.exports = {
  db,
  dbGet,
  dbAll,
  dbRun,
  generateConsecutive
};
