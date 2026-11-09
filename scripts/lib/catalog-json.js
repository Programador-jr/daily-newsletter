'use strict';

// Serializa o catálogo no mesmo formato de public/data/political-catalog.json
// (o do Prettier): JSON com 2 espaços; listas e objetos de valores simples
// ficam numa linha só quando cabem em 80 colunas, e listas longas de números
// são distribuídas em linhas. Mantém os diffs pequenos ao gravar.
const WIDTH = 80;

const isPrimitive = item => item === null || typeof item !== 'object';

function fillNumbers(value, pad, close) {
  const lines = [];
  let line = '';
  value.forEach((item, index) => {
    const piece = `${item}${index < value.length - 1 ? ',' : ''}`;
    if (line && pad.length + line.length + 1 + piece.length > WIDTH) {
      lines.push(line);
      line = piece;
    } else {
      line = line ? `${line} ${piece}` : piece;
    }
  });
  lines.push(line);
  return `[\n${lines.map(text => pad + text).join('\n')}\n${close}]`;
}

// suffixLength conta a vírgula que vem depois do valor na mesma linha.
function format(value, indent, prefixLength, suffixLength = 0) {
  if (isPrimitive(value)) return JSON.stringify(value);
  const pad = ' '.repeat(indent + 2);
  const close = ' '.repeat(indent);
  const fits = inline => prefixLength + inline.length + suffixLength <= WIDTH;
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    if (value.every(isPrimitive)) {
      const inline = `[${value.map(item => JSON.stringify(item)).join(', ')}]`;
      if (fits(inline)) return inline;
      if (value.every(item => typeof item === 'number')) return fillNumbers(value, pad, close);
    }
    const items = value.map((item, index) => pad + format(item, indent + 2, pad.length, index < value.length - 1 ? 1 : 0));
    return `[\n${items.join(',\n')}\n${close}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  if (entries.every(([, item]) => isPrimitive(item))) {
    const inline = `{ ${entries.map(([key, item]) => `${JSON.stringify(key)}: ${JSON.stringify(item)}`).join(', ')} }`;
    if (fits(inline)) return inline;
  }
  const lines = entries.map(([key, item], index) => {
    const head = `${pad}${JSON.stringify(key)}: `;
    return head + format(item, indent + 2, head.length, index < entries.length - 1 ? 1 : 0);
  });
  return `{\n${lines.join(',\n')}\n${close}}`;
}

const stringifyCatalog = catalog => `${format(catalog, 0, 0)}\n`;

module.exports = { stringifyCatalog };
