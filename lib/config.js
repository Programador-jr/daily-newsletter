function validateRuntimeEnvironment(environment = process.env) {
  if (environment.PORT !== undefined) {
    const port = Number(environment.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
    }
  }

  if (environment.APP_URL) {
    let appUrl;
    try {
      appUrl = new URL(environment.APP_URL);
    } catch {
      throw new Error('APP_URL deve ser uma URL HTTP ou HTTPS válida.');
    }

    if (!['http:', 'https:'].includes(appUrl.protocol)) {
      throw new Error('APP_URL deve ser uma URL HTTP ou HTTPS válida.');
    }
    if (appUrl.username || appUrl.password) {
      throw new Error('APP_URL não pode incluir credenciais.');
    }
  }

  const hasEmailUser = Boolean(environment.EMAIL_USER?.trim());
  const hasEmailPass = Boolean(environment.EMAIL_PASS?.trim());
  if (hasEmailUser !== hasEmailPass) {
    throw new Error('Configure EMAIL_USER e EMAIL_PASS juntos para habilitar o envio de e-mail.');
  }

  const warnings = [];
  if (!environment.MONGODB_URI?.trim()) {
    warnings.push('Banco de dados desabilitado: configure MONGODB_URI para habilitar funcionalidades persistentes.');
  }
  if (!hasEmailUser) {
    warnings.push('Envio de e-mail desabilitado: configure EMAIL_USER e EMAIL_PASS.');
  }
  if (!environment.NOTIFY_SECRET?.trim()) {
    warnings.push('Publicação protegida desabilitada: configure NOTIFY_SECRET.');
  }

  return { warnings };
}

function requireEnvironment(names, environment = process.env) {
  const missing = names.filter(name => !environment[name]?.trim());
  if (missing.length) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}.`);
  }
}

module.exports = { requireEnvironment, validateRuntimeEnvironment };
