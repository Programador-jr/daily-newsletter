const fs = require('fs');
const path = require('path');

const dataDirectory = path.resolve(process.cwd(), 'data');

module.exports = function handler(req, res) {
  const requestedPath = req.query.path;
  const relativePath = Array.isArray(requestedPath)
    ? requestedPath.join(path.sep)
    : requestedPath;

  if (typeof relativePath !== 'string' || !relativePath.endsWith('.json')) {
    res.statusCode = 404;
    return res.end('Not found');
  }

  const filePath = path.resolve(dataDirectory, relativePath);
  const pathFromData = path.relative(dataDirectory, filePath);
  if (pathFromData.startsWith('..') || path.isAbsolute(pathFromData)) {
    res.statusCode = 400;
    return res.end('Invalid path');
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      res.statusCode = error.code === 'ENOENT' ? 404 : 500;
      return res.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(contents);
  });
};