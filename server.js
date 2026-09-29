require('dotenv').config();

const express = require('express');
const path = require('path');
const oauth2 = require('./api/oauth2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/api/news', require('./api/news'));
app.post('/api/news', require('./api/news'));
app.post('/api/subscribe', require('./api/subscribe'));
app.get('/api/confirm', require('./api/confirm'));
app.get('/api/unsubscribe', require('./api/unsubscribe'));
app.post('/api/notify-news', require('./api/notify-news'));
app.get('/api/oauth2/authorize', oauth2.authorize);
app.get('/api/oauth2/callback', oauth2.callback);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/editions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/editions.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});