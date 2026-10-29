require('dotenv').config();

const express = require('express');
const os = require('os');
const path = require('path');
const { validateRuntimeEnvironment } = require('./lib/config');
const { securityHeaders } = require('./lib/security-headers');
const { errorHandler } = require('./lib/error-handler');

const { warnings } = validateRuntimeEnvironment();
warnings.forEach(message => console.warn(`[config] ${message}`));

const app = express();
const PORT = process.env.PORT || 3000;
// Sem HOST o Node escuta em todas as interfaces (IPv4 e IPv6), o que já atende
// a rede local. Defina HOST=0.0.0.0 para restringir a IPv4.
const HOST = process.env.HOST || null;

function localIpv4Addresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(iface => iface && !iface.internal && iface.family === 'IPv4')
    .map(iface => iface.address);
}


app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data'), { dotfiles: 'deny', index: false }));

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

app.get('/personalidades', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/personalidades.html'));
});
app.get('/paises', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/paises.html'));
});

app.get('/partidos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/partidos.html'));
});

app.get('/livros', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/livros.html'));
});

app.get('/teste-politico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/teste-politico.html'));
});

app.get('/resultado-politico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/results-12axes.html'));
});

app.get('/catalogo-politico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/catalogo-politico.html'));
});

app.get('/comparar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/comparar.html'));
});

app.get('/valores', (req, res) => {
  res.redirect(301, '/catalogo-politico?catalogo=valores');
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

app.use(errorHandler);

const server = HOST ? app.listen(PORT, HOST) : app.listen(PORT);

server.on('listening', () => {
  const { address, port } = server.address();
  const family = address === '::' || address === '0.0.0.0' ? 'todas as interfaces' : address;
  console.log(`Servidor rodando em http://localhost:${port} (${family})`);

  const lanAddresses = localIpv4Addresses();
  if (lanAddresses.length) {
    console.log(`Na rede local: ${lanAddresses.map(ip => `http://${ip}:${port}`).join(' | ')}`);
  } else {
    console.log('Nenhum endereço IPv4 de rede local encontrado.');
  }
});
