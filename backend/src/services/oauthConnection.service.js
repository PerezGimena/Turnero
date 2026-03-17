const { OAuthConnection } = require('../models');

const getConnection = async (profesionalId, provider) => {
  return OAuthConnection.findOne({ where: { profesionalId, provider } });
};

const upsertConnection = async (profesionalId, provider, payload) => {
  const existente = await getConnection(profesionalId, provider);
  if (!existente) {
    return OAuthConnection.create({
      profesionalId,
      provider,
      status: 'conectado',
      ...payload,
    });
  }

  await existente.update({
    ...payload,
    status: payload.status || 'conectado',
  });

  return existente;
};

const disconnectByProfesional = async (profesionalId) => {
  await OAuthConnection.update(
    {
      accessToken: null,
      refreshToken: null,
      status: 'desconectado',
    },
    { where: { profesionalId } }
  );
};

module.exports = {
  getConnection,
  upsertConnection,
  disconnectByProfesional,
};
