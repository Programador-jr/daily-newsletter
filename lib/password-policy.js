// Admin password rules: at least 8 characters, with an uppercase letter,
// a digit and a special character (anything that is not a letter or digit).
const PASSWORD_RULES = [
  { id: 'length', label: 'pelo menos 8 caracteres', test: value => [...value].length >= 8 },
  { id: 'uppercase', label: 'uma letra maiúscula', test: value => /\p{Lu}/u.test(value) },
  { id: 'digit', label: 'um número', test: value => /\d/.test(value) },
  { id: 'special', label: 'um caractere especial', test: value => /[^\p{L}\p{N}\s]/u.test(value) }
];

/** Labels of the rules the password breaks; empty when it is valid. */
function passwordPolicyFailures(value) {
  const password = String(value ?? '');
  return PASSWORD_RULES.filter(rule => !rule.test(password)).map(rule => rule.label);
}

function isStrongPassword(value) {
  return passwordPolicyFailures(value).length === 0;
}

module.exports = { PASSWORD_RULES, passwordPolicyFailures, isStrongPassword };
