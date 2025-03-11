/* ===== IMPORTACIONES =====
 * Importación de módulos necesarios para el funcionamiento de la aplicación
 * Express: Framework web
 * Multer: Manejo de archivos
 * PostgreSQL: Base de datos
 * Otros módulos de utilidad
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import "dotenv/config";
import pkg from 'pg';
const { Pool } = pkg;
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

/* ===== CONFIGURACIÓN DE DIRECTORIOS =====
 * Configuración de rutas y directorios para el almacenamiento de archivos
 * Creación de directorios si no existen
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, 'public/uploads/productos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadDirRecetas = join(__dirname, 'public/uploads/recetas');
if (!fs.existsSync(uploadDirRecetas)) {
    fs.mkdirSync(uploadDirRecetas, { recursive: true });
}

/* ===== CONFIGURACIÓN DE MULTER PARA RECETAS =====
 * Configuración para el manejo de imágenes de recetas
 * Incluye validaciones y límites de tamaño
 */
const storageRecetas = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirRecetas);
    },
    filename: function (req, file, cb) {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});

const uploadReceta = multer({
    storage: storageRecetas,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('No es un archivo de imagen válido'));
        }
    }
});

/* ===== CONFIGURACIÓN DE MULTER PARA PRODUCTOS =====
 * Configuración para el manejo de imágenes de productos
 * Similar a la configuración de recetas
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('No es un archivo de imagen válido'));
        }
    }
});

/* ===== CONFIGURACIÓN DE BASE DE DATOS =====
 * Conexión a PostgreSQL y prueba de conexión
 */
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

pool.connect((err, client, done) => {
    if (err) {
        console.error("❌ Error de conexión:", err);
    } else {
        console.log("✅ Conectado a PostgreSQL");
        done();
    }
});

/* ===== CONFIGURACIÓN DE EXPRESS =====
 * Configuración básica de la aplicación Express
 * Middlewares y configuraciones de seguridad
 */
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'damabrava-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

/* ===== MIDDLEWARES DE AUTENTICACIÓN =====
 * Funciones para proteger rutas y manejar caché
 */
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
};

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

/* ===== CONFIGURACIÓN DE VISTAS =====
 * Configuración del motor de plantillas y archivos estáticos
 */
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'public/uploads')));

/* ===== RUTAS DE AUTENTICACIÓN =====
 * Manejo de login y logout
 */
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'hector' && password === '123') {
        req.session.isAuthenticated = true;
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
});

/* ===== RUTAS DE API PARA PREVISUALIZACIONES =====
 * Endpoints para obtener previsualizaciones de productos y recetas
 */
app.get('/api/productos/preview', async (req, res) => {
    try {
        const productosQuery = `
            SELECT p.id, p.nombre, 
                   p.imagen_url,
                   json_agg(
                       json_build_object(
                           'peso', g.peso,
                           'precio', g.precio
                       )
                   ) as gramajes
            FROM productos p
            LEFT JOIN gramajes g ON p.id = g.producto_id
            GROUP BY p.id, p.nombre, p.imagen_url
            LIMIT 3
        `;
        
        const result = await pool.query(productosQuery);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos preview:', error);
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});

app.get('/api/recetas/preview', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recetas ORDER BY nombre LIMIT 3');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener preview de recetas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las recetas' });
    }
});

/* ===== RUTAS DE API PARA PRODUCTOS =====
 * CRUD completo para productos
 */
// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productosQuery = `
            SELECT p.id, p.nombre, 
                   p.imagen_url,
                   json_agg(
                       json_build_object(
                           'peso', g.peso,
                           'precio', g.precio
                       )
                   ) as gramajes
            FROM productos p
            LEFT JOIN gramajes g ON p.id = g.producto_id
            GROUP BY p.id, p.nombre, p.imagen_url
        `;
        
        const result = await pool.query(productosQuery);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});

// Obtener un producto específico
app.get('/api/productos/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, json_agg(
                json_build_object(
                    'peso', g.peso,
                    'precio', g.precio
                )
            ) as gramajes
            FROM productos p
            LEFT JOIN gramajes g ON p.id = g.producto_id
            WHERE p.id = $1
            GROUP BY p.id
        `, [req.params.id]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
});

// Crear nuevo producto
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, gramajes } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ mensaje: 'La imagen es requerida' });
        }

        const imagenUrl = `/uploads/productos/${req.file.filename}`;
        
        const result = await pool.query(
            'INSERT INTO productos (nombre, imagen_url) VALUES ($1, $2) RETURNING id',
            [nombre, imagenUrl]
        );

        const productoId = result.rows[0].id;
        const gramajesToInsert = JSON.parse(gramajes);

        for (const gramaje of gramajesToInsert) {
            await pool.query(
                'INSERT INTO gramajes (producto_id, peso, precio) VALUES ($1, $2, $3)',
                [productoId, gramaje.gramaje + 'g', gramaje.precio]
            );
        }

        res.status(201).json({ 
            mensaje: 'Producto creado exitosamente',
            id: productoId,
            imagen_url: imagenUrl
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ mensaje: 'Error al crear el producto: ' + error.message });
    }
});

// Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM gramajes WHERE producto_id = $1', [req.params.id]);
        const result = await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        
        if (result.rowCount > 0) {
            res.json({ mensaje: 'Producto eliminado correctamente' });
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
});

// Actualizar producto
app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, gramajes } = req.body;
        const gramajesToAdd = JSON.parse(gramajes);
        
        let query = 'UPDATE productos SET nombre = $1';
        let values = [nombre];
        let paramCount = 1;

        if (req.file) {
            paramCount++;
            query += `, imagen_url = $${paramCount}`;
            values.push(`/uploads/productos/${req.file.filename}`);
        }

        query += ` WHERE id = $${paramCount + 1}`;
        values.push(req.params.id);

        await pool.query(query, values);
        await pool.query('DELETE FROM gramajes WHERE producto_id = $1', [req.params.id]);
        
        for (const gramaje of gramajesToAdd) {
            await pool.query(
                'INSERT INTO gramajes (producto_id, peso, precio) VALUES ($1, $2, $3)',
                [req.params.id, gramaje.gramaje + 'g', gramaje.precio]
            );
        }
        
        res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el producto: ' + error.message });
    }
});

/* ===== RUTAS DE API PARA RECETAS =====
 * CRUD completo para recetas
 */
// Obtener todas las recetas
app.get('/api/recetas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recetas');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las recetas' });
    }
});

// Obtener una receta específica
app.get('/api/recetas/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM recetas WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ mensaje: 'Receta no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener receta:', error);
        res.status(500).json({ mensaje: 'Error al obtener la receta' });
    }
});

// Crear nueva receta
app.post('/api/recetas', uploadReceta.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, url } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ mensaje: 'La imagen es requerida' });
        }

        const imagenUrl = `/uploads/recetas/${req.file.filename}`;
        
        const result = await pool.query(
            'INSERT INTO recetas (nombre, descripcion, url, imagen) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, url, imagenUrl]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear receta:', error);
        res.status(500).json({ mensaje: 'Error al crear la receta' });
    }
});

// Eliminar receta
app.delete('/api/recetas/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM recetas WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rowCount > 0) {
            // Eliminar la imagen asociada si existe
            const imagePath = join(__dirname, 'public', result.rows[0].imagen);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            res.json({ mensaje: 'Receta eliminada correctamente' });
        } else {
            res.status(404).json({ mensaje: 'Receta no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar receta:', error);
        res.status(500).json({ mensaje: 'Error al eliminar la receta' });
    }
});

// Actualizar receta
app.put('/api/recetas/:id', uploadReceta.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, url } = req.body;
        
        let query = 'UPDATE recetas SET nombre = $1, descripcion = $2, url = $3';
        let values = [nombre, descripcion, url];
        let paramCount = 3;

        if (req.file) {
            paramCount++;
            query += `, imagen = $${paramCount}`;
            values.push(`/uploads/recetas/${req.file.filename}`);
        }

        query += ` WHERE id = $${paramCount + 1} RETURNING *`;
        values.push(req.params.id);

        const result = await pool.query(query, values);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ mensaje: 'Receta no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar receta:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la receta' });
    }
});

/* ===== RUTAS DE VISTAS =====
 * Renderizado de páginas EJS
 */
app.get('/', (req, res) => {
    res.render('inicio');
});

app.get('/productos', (req, res) => {
    res.render('productos');
});

app.get('/recetas', (req, res) => {
    res.render('recetas');
});

app.get('/adm', requireAuth, nocache, (req, res) => {
    res.render('adm');
});

/* ===== INICIAR SERVIDOR =====
 * Configuración del puerto y mensaje de inicio
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});