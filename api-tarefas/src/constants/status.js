const STATUS = {
  NAO_REALIZADA: 'não realizada',
  AGUARDANDO: 'aguardando',
  FEITA: 'feita',
};

const STATUS_VALIDOS = Object.values(STATUS);

const STATUS_PADRAO = STATUS.NAO_REALIZADA;

const ehStatusValido = (status) => STATUS_VALIDOS.includes(status);

const mensagemStatusInvalido = () =>
  `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}`;

module.exports = {
  STATUS,
  STATUS_VALIDOS,
  STATUS_PADRAO,
  ehStatusValido,
  mensagemStatusInvalido,
};
