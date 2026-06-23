import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:3000/api';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await axios.post(`${API}${endpoint}`, { username, password });
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        alert('Konto utworzone! Możesz się teraz zalogować.');
        setIsLogin(true);
      }
    } catch (err) {
      alert('Błąd: ' + (err.response?.data?.error || 'Problem z serwerem'));
    }
  };

  return (
    <div className="container">
      <h2>{isLogin ? 'Logowanie' : 'Rejestracja'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Login" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">{isLogin ? 'Zaloguj' : 'Zarejestruj'}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} className="toggle">
        {isLogin ? 'Nie masz konta? Zarejestruj się.' : 'Masz konto? Zaloguj się.'}
      </p>
    </div>
  );
};

const Board = ({ token, onLogout }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    setTasks(res.data);
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Do zrobienia' ? 'Zrobione' : 'Do zrobienia';
    await axios.put(`${API}/tasks/${task.id}`, { ...task, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    fetchTasks();
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="container">
      <header>
        <h2>TaskBoard</h2>
        <button onClick={onLogout} className="logout-btn">Wyloguj</button>
      </header>
      <Link to="/new" className="btn-primary">Dodaj nowe zadanie</Link>
      <div className="task-list">
        {tasks.map(t => (
          <div key={t.id} className="task-card">
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <small>Status: <strong>{t.status}</strong></small>
            {t.latitude && (
              <small style={{ display: 'block', color: 'gray', marginTop: '4px', fontSize: '0.8rem' }}>
                Lokalizacja: {t.latitude.toFixed(2)}, {t.longitude.toFixed(2)}
              </small>
            )}
            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
              <button onClick={() => toggleStatus(t)} className="btn-primary" style={{margin: 0, padding: '8px', flex: 1}}>Zmień status</button>
              <button onClick={() => deleteTask(t.id)} className="delete-btn" style={{margin: 0, padding: '8px', flex: 1}}>Usuń</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p>Brak zadań. Dodaj coś!</p>}
      </div>
    </div>
  );
};

const NewTask = ({ token }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/tasks`, { title, description: desc, status: 'Do zrobienia' }, { headers: { Authorization: `Bearer ${token}` } });
    navigate('/');
  };

  return (
    <div className="container">
      <h2>Nowe Zadanie</h2>
      <form onSubmit={handleAdd}>
        <input placeholder="Tytuł" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Opis" value={desc} onChange={e => setDesc(e.target.value)} />
        <button type="submit">Zapisz</button>
      </form>
      <Link to="/" className="cancel-link">Anuluj</Link>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
        <Route path="/" element={token ? <Board token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/new" element={token ? <NewTask token={token} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
