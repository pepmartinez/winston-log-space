var Log = require ('../');
var winston = require ('winston');


var config = {
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

Log.init (config, (err) => {
  if (err) return console.error(err)
  l1 = Log.logger ('s1');
  l2 = Log.logger ('s2:s3:s4');

  l1.info    ('this is l1 on info %s, %d', 'ggg', 666);
  l1.verbose ('this is l1 on verbose %s, %d', 'ggg', 666);

  l2.info    ('this is l2 on info %s, %d', 'ggg', 666);
  l2.verbose ('this is l2 on verbose %s, %d', 'ggg', 666);
});
