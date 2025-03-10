import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
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
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Auth Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
};

// Middleware para prevenir el acceso a la caché después del logout
const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

// Configuración de EJS y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static(join(__dirname, 'public')));

// Auth Routes
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

// Routes
app.get('/', (req, res) => {
    res.render('inicio');
});
app.get('/productos', (req, res) => {
    res.render('productos');
});
app.get('/recetas', (req, res) => {
    res.render('recetas');
});
app.get('/nosotros', (req, res) => {
    res.render('nosotros');
});
app.get('/adm', requireAuth, nocache, (req, res) => {
    res.render('adm');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});