module.exports = {
  PROTOCOL: process.env.PROTOCOL || 'http:',
  HOSTNAME: process.env.HOSTNAME || 'localhost',
  PORT: process.env.PORT || 3000,
  TIMEOUT: process.env.TIMEOUT || 30000,
  RESOURCES: process.env.RESOURCES || '/api/resources'
};
