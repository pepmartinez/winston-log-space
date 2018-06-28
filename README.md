# winston-log-space
Per-module wrapper over a winston v3 logger

## Motivation
Winston is a great logger platform, but it lacks abilities to provide different *subloggers* with different loglevels, as one can find in, for example, log4j

Thus, I decided to see if such a thing would be easy to do on top of the freshly-released winston v3

## Structure
winston-log-space (wls henceforth) works in the following way:
* a single winston logger is created; it can have whatever transports as desired, and its *format* can also be specified. Its level will be set to *silly*
* a set of shallow, light loggers with the usual 'log()' and 'debug()/verbose()/info()... ' interface are created on demand, using a hierarchical module naming (separator is ':'). Each of this shallow loggers will have its own level and a simple check on it, so they will or will not cal the *root* winston logger depending on their level
* many aspects such as the associations of loglevels to name hierarchies are configurable via env vars, command line options or even js files

## Quick start
Let us have a `test.js` file:
```javascript
var Log = require ('winston-log-space');

Log.init ((err) => {
  if (err) return console.error(err)

  l1 = Log.logger ('s1');
  l2 = Log.logger ('s2:s3:s4');

  l1.info    ('this is l1 on info %s, %d', 'ggg', 666);
  l1.verbose ('this is l1 on verbose %s, %d', 'ggg', 666);

  l2.info    ('this is l2 on info %s, %d', 'ggg', 666);
  l2.verbose ('this is l2 on verbose %s, %d', 'ggg', 666);
});
```

then, running it with various command line options we get: 
```bash
$ node test.js 
2018-06-27T15:17:09.554Z [s1] info: this is l1 on info ggg, 666
2018-06-27T15:17:09.556Z [s2:s3:s4] info: this is l2 on info ggg, 666

$ node test.js --log__level__s1=debug
2018-06-27T15:17:12.331Z [s1] info: this is l1 on info ggg, 666
2018-06-27T15:17:12.333Z [s1] verbose: this is l1 on verbose ggg, 666
2018-06-27T15:17:12.333Z [s2:s3:s4] info: this is l2 on info ggg, 666

$ node test.js --log__level__s2=debug
2018-06-27T15:17:18.415Z [s1] info: this is l1 on info ggg, 666
2018-06-27T15:17:18.417Z [s2:s3:s4] info: this is l2 on info ggg, 666
2018-06-27T15:17:18.417Z [s2:s3:s4] verbose: this is l2 on verbose ggg, 666
```

Alternatively, we can use env vars:
```bash
$ LOG_level__s1=debug node test.js 
2018-06-27T15:19:39.274Z [s1] info: this is l1 on info ggg, 666
2018-06-27T15:19:39.276Z [s1] verbose: this is l1 on verbose ggg, 666
2018-06-27T15:19:39.277Z [s2:s3:s4] info: this is l2 on info ggg, 666

$ LOG_level__s2=debug node test.js 
2018-06-27T15:20:15.196Z [s1] info: this is l1 on info ggg, 666
2018-06-27T15:20:15.199Z [s2:s3:s4] info: this is l2 on info ggg, 666
2018-06-27T15:20:15.199Z [s2:s3:s4] verbose: this is l2 on verbose ggg, 666
```
## Configuration
All of the configuration magic inside `init()` is done using [cascade-config](https://github.com/pepmartinez/cascade-config), using the following config cascade:
* a `defaults` object
* the `opts` object passed as first param to `init()` if any
* env vars, with `prefix: LOG_`
* args, with `prefix: log.`
* contents of file `process.cwd() + '/log.js'`
* contents of file `process.cwd() + '/log-{env}.js'`
* contents of a file whose name is specified in config as `wlsconfig`

### using `init(opts, cb)`
As stated, you can inline your confi, or extra defults, by passing them to `init()`:
```javascript
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
```

This will get you:
```bash
$ node inline-config.js 
2018-06-28T06:23:02.817Z | s1 | info | this is l1 on info ggg, 666
2018-06-28T06:23:02.819Z | s1 | verbose | this is l1 on verbose ggg, 666
2018-06-28T06:23:02.820Z | s2:s3:s4 | info | this is l2 on info ggg, 666

$ cat test.log 
2018-06-28T06:23:02.817Z | s1 | info | this is l1 on info ggg, 666
2018-06-28T06:23:02.819Z | s1 | verbose | this is l1 on verbose ggg, 666
2018-06-28T06:23:02.820Z | s2:s3:s4 | info | this is l2 on info ggg, 666
```

### using files
Creating a `log.js` file in your PWD is also a way:
```javascript
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
```

so, running your js in the same directory:
```bash
$ node basic.js 
2018-06-28T06:25:56.812Z | s1 | info | this is l1 on info ggg, 666
2018-06-28T06:25:56.815Z | s1 | verbose | this is l1 on verbose ggg, 666
2018-06-28T06:25:56.815Z | s2:s3:s4 | info | this is l2 on info ggg, 666
```

### or, passing any file as config
You can also pass any file, not just `./log.js` as source for your config; simply specify anywhere in your config sources a key `wlsconfig` which should contain the filename (as an absolute path). For example, passing it via cli:
```bash
$ node basic.js --log__wlsconfig=$PWD/config-log.js
2018-06-28T06:29:15.413Z | s1 | info | this is l1 on info ggg, 666
2018-06-28T06:29:15.415Z | s1 | verbose | this is l1 on verbose ggg, 666
2018-06-28T06:29:15.416Z | s2:s3:s4 | info | this is l2 on info ggg, 666
```