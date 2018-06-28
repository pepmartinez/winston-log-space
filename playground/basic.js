var Log = require ('../');

Log.init ((err) => {
  if (err) return console.error(err)
  l1 = Log.logger ('s1');
  l2 = Log.logger ('s2:s3:s4');

  l1.info    ('this is l1 on info %s, %d', 'ggg', 666);
  l1.verbose ('this is l1 on verbose %s, %d', 'ggg', 666);

  l2.info    ('this is l2 on info %s, %d', 'ggg', 666);
  l2.verbose ('this is l2 on verbose %s, %d', 'ggg', 666);
});
