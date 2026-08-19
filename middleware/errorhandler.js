function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({ error: 'That resource already exists.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
        error: err.message 
    });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
}

module.exports = { notFound, errorHandler };