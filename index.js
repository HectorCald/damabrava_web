/* ===== IMPORTACIONES ===== */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import { google } from 'googleapis';
import admin from 'firebase-admin';

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
        maxAge: 24 * 60 * 60 * 1000,
    }
}));

/* ==================== CONFIGURACIÓN DE FIREBASE ==================== */
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ===== CONFIGURACIÓN GOOGLE AUTH PARA SPREADSHEET ===== */
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
});

/* ===== CONFIGURACIÓN DE VISTAS ===== */
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'public/uploads')));

/* ===== RUTAS DE VISTAS ===== */
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

/* ===== RUTA PARA OBTENER PRODUCTOS DESDE GOOGLE SHEETS ===== */
app.get('/obtener-productos', async (req, res) => {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID_1,
            range: 'Almacen general!A2:O'
        });

        const rows = response.data.values || [];

        const productos = rows.map(row => ({
            id: row[0] || '',
            producto: row[1] || '',
            gramos: row[2] || '',
            stock: row[3] || '',
            cantidadxgrupo: row[4] || '',
            lista: row[5] || '',
            codigo_barras: row[6] || '',
            precios: row[7] || '',
            etiquetas: row[8] || '',
            acopio_id: row[9] || '',
            alm_acopio_producto: row[10] || '',
            imagen: row[11] || '',
            uSueltas: row[12] || '',
            promociones: row[13] || '',
            precio_promo: row[14] || '',
        }));

        res.json({ success: true, productos });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener los productos' });
    }
});
/* ===== RUTA PARA OBTENER RECETAS DESDE GOOGLE SHEETS ===== */
app.get('/obtener-recetas', async (req, res) => {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID_1,
            range: 'Recetas!A2:G'
        });

        const rows = response.data.values || [];

        const recetas = rows.map(row => ({
            id: row[0] || '',
            nombre: row[1] || '',
            descripcion: row[2] || '',
            tiempo: row[3] || '',
            url: row[4] || '',
            imagen: row[5] || '',
            dificultad: row[6] || '',
        }));

        res.json({ success: true, recetas });
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({ success: false, error: 'Error las recetas' });
    }
});
/* ==================== RUTAS ETIQUETAS DE AlMACEN ==================== */
app.get('/obtener-etiquetas',async (req, res) => {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID_1,
            range: 'Etiquetas web!A:A' // Columnas A y B para ID y ETIQUETA
        });

        const rows = response.data.values || [];

        const etiquetas = rows.map(row => ({
            etiqueta: row[0] || ''
        }));

        res.json({
            success: true,
            etiquetas
        });

    } catch (error) {
        console.error('Error al obtener etiquetas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las etiquetas'
        });
    }
});

const drive = google.drive({ version: 'v3', auth });
const CATALOGO_FOLDER = process.env.CATALOGO_FOLDER;

/* ===== RUTA PARA OBTENER CATALOGO DESDE GOOGLE DRIVE ===== */
app.get('/obtener-catalogo', async (req, res) => {
    try {
        if (!CATALOGO_FOLDER) {
            console.error('[Catalogo] No está configurada la carpeta de catálogo');
            return res.status(500).json({ success: false, error: 'No está configurada la carpeta de catálogo' });
        }
        const list = await drive.files.list({
            q: `'${CATALOGO_FOLDER}' in parents and name = 'catalogo-damabrava.pdf' and trashed = false`,
            fields: 'files(id)'
        });
        if (!list.data.files.length) {
            return res.json({ success: true, url: null });
        }
        const fileId = list.data.files[0].id;
        const url = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log('[Catalogo] Catálogo encontrado. URL:', url);
        res.json({ success: true, url });
    } catch (error) {
        console.error('[Catalogo] Error al obtener catálogo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/* ===== INICIALIZACIÓN DEL SERVIDOR ===== */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

export default app;