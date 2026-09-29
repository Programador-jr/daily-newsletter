const crypto = require('crypto');
const { google } = require('googleapis');

const SCOPES = ['https://mail.google.com/'];
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth2/callback';
let pendingState = null;

function getOAuthClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET precisam estar configurados.');
  }
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
}

function createAuthorizationUrl() {
  const oauth2Client = getOAuthClient();
  pendingState = crypto.randomBytes(32).toString('hex');
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    login_hint: process.env.EMAIL_USER || undefined,
    scope: SCOPES,
    state: pendingState
  });
}

async function exchangeCode(code, state) {
  if (!pendingState || state !== pendingState) throw new Error('Estado OAuth inválido ou expirado.');
  pendingState = null;
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

module.exports = { createAuthorizationUrl, exchangeCode, REDIRECT_URI, SCOPES };