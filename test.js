var Log = require ('./');

Log.init ((err) => {
  if (err) return console.error(err)
  l1 = Log.logger ('s1');
  l2 = Log.logger ('s0:s1:s2:s3:s4');

  l1.info ('hey ya l1 on info %s, %d', 'ggg', 666);
  l1.verbose ('hey ya l1 on verbose %s, %d', 'ggg', 666);
  l2.info ('hey ya l2 on info %s, %d', 'ggg', 666);
  l2.verbose ('hey ya l2 on verbose %s, %d', 'ggg', 666);
});
