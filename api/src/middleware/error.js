export function notFound(_req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erro interno do servidor.' });
}
