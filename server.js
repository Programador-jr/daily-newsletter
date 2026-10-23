require('dotenv').config();

const express = require('express');
const path = require('path');
const { validateRuntimeEnvironment } = require('./lib/config');

const { warnings } = validateRuntimeEnvironment();
warnings.forEach(message => console.warn(`[config] ${message}`));

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
app.post('/api/unsubscribe', require('./api/unsubscribe'));
app.post('/api/notify-news', require('./api/notify-news'));
app.post('/api/admin/login', require('./lib/api-handlers/admin/login'));
app.post('/api/admin/logout', require('./lib/api-handlers/admin/logout'));
app.get('/api/admin/dashboard', require('./lib/api-handlers/admin/dashboard'));
app.post('/api/admin/dispatch', require('./lib/api-handlers/admin/dispatch'));
app.post('/api/admin/test-email', require('./lib/api-handlers/admin/test-email'));
app.get('/api/admin/schedule', require('./lib/api-handlers/admin/schedule'));
app.put('/api/admin/schedule', require('./lib/api-handlers/admin/schedule'));
app.all('/api/admin/updates', require('./lib/api-handlers/admin/updates'));
app.get('/api/updates/active', require('./lib/api-handlers/updates/active'));
app.get('/api/worker/config', require('./lib/api-handlers/worker/config'));
app.post('/api/worker/heartbeat', require('./lib/api-handlers/worker/heartbeat'));
app.get('/api/camara-deputados', require('./lib/api-handlers/public-data/camara-deputados'));
app.get('/api/camara-despesas', require('./lib/api-handlers/public-data/camara-despesas'));
app.get('/api/camara-ceap', require('./lib/api-handlers/public-data/camara-ceap'));
app.get('/api/transferegov-emendas', require('./lib/api-handlers/public-data/transferegov-emendas'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/editions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/editions.html'));
});

app.get('/historia', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/historia.html'));
});

app.get('/presidentes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/presidentes.html'));
});

app.get('/ideologias', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/ideologias.html'));
});

app.get('/politica', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/politica.html'));
});

app.get('/economia', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/economia.html'));
});

app.get('/fascismo-nazismo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/fascismo-nazismo.html'));
});

app.get('/politicas-publicas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/politicas-publicas.html'));
});

app.get('/tres-poderes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/tres-poderes.html'));
});

app.get('/cargos-publicos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/cargos-publicos.html'));
});

app.get('/arrecadacao', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/arrecadacao.html'));
});

app.get('/gastos-publicos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/gastos-publicos.html'));
});

app.get('/impostos-gastos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/impostos-gastos.html'));
});

app.get('/gastos-parlamentares', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/gastos-parlamentares.html'));
});

app.get('/como-funciona-estado', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/estado-brasileiro.html'));
});

app.get('/como-fiscalizar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/como-fiscalizar.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
