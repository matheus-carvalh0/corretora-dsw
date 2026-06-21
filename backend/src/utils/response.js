/**
 * Utilitários para padronizar respostas da API.
 */

const success = (res, data = {}, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const created = (res, data = {}, message = 'Criado com sucesso.') => {
  return success(res, data, message, 201);
};

const noContent = (res) => {
  return res.status(204).send();
};

const badRequest = (res, message = 'Requisição inválida.', errors = []) => {
  return res.status(400).json({ success: false, message, errors });
};

const unauthorized = (res, message = 'Não autorizado.') => {
  return res.status(401).json({ success: false, message });
};

const forbidden = (res, message = 'Acesso negado.') => {
  return res.status(403).json({ success: false, message });
};

const notFound = (res, message = 'Recurso não encontrado.') => {
  return res.status(404).json({ success: false, message });
};

const conflict = (res, message = 'Conflito de dados.') => {
  return res.status(409).json({ success: false, message });
};

const serverError = (res, message = 'Erro interno do servidor.') => {
  return res.status(500).json({ success: false, message });
};

module.exports = { success, created, noContent, badRequest, unauthorized, forbidden, notFound, conflict, serverError };
