const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'super-tajny-klucz-zaliczeniowy'; 

app.use(cors());
app.use(express.json());

// Inicjalizacja bazy SQLite w pliku lokalnym
const db = new sqlite3.Database('./taskboard.sqlite', (err) => {
    if (err) console.error('Błąd połączenia z bazą:', err.message);
    else console.log('Połączono z bazą SQLite.');
});

// Tworzenie relacyjnego modelu danych
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        status TEXT,
        latitude REAL,
        longitude REAL,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// --- SYSTEM UWIERZYTELNIANIA ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Brak danych logowania' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: 'Użytkownik o takiej nazwie już istnieje' });
        res.status(201).json({ message: 'Utworzono użytkownika', id: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Nie znaleziono użytkownika' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(403).json({ error: 'Błędne hasło' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

// Middleware weryfikujący token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- REST API (OPERACJE CRUD DLA ZADAŃ) ---

// [R] Pobieranie wszystkich zadań zalogowanego użytkownika
app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// [C] Dodawanie nowego zadania (obsługuje opcjonalne koordynaty z mobile)
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, status, latitude, longitude } = req.body;
    
    db.run(
        `INSERT INTO tasks (title, description, status, latitude, longitude, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || '', status || 'Do zrobienia', latitude || null, longitude || null, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, title, description, status, latitude, longitude });
        }
    );
});

// [U] Aktualizacja zadania (np. przesunięcie na tablicy Kanban)
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { title, description, status } = req.body;
    
    db.run(
        `UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?`,
        [title, description, status, req.params.id, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Zaktualizowano zadanie', changes: this.changes });
        }
    );
});

// [D] Usuwanie zadania
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    db.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usunięto zadanie', changes: this.changes });
    });
});

// Uruchomienie nasłuchiwania
app.listen(PORT, () => {
    console.log(`Backend API działa poprawnie na http://localhost:${PORT}`);
});