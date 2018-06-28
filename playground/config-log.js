var winston = require ('winston');

module.exports = {
  level: {
    s1: 'silly'
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.printf(info => `${info.timestamp} | ${info.area} | ${info.level} | ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'test.log'})
  ]
};