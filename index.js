var winston = require ('winston');
var CC =      require ('cascade-config');

const { LEVEL, SPLAT } = require('triple-beam');

var _config = {};
var _slave_logger = null;
var _loggers = {};


///////////////////////////////////////////////////
class WrapLogger {
  constructor (opts) {
    this._area = opts.area;
    this._level = opts.level;
    this._nlevel = _slave_logger.levels[opts.level];
    
    Object.keys (_slave_logger.levels).forEach (method => {
      this[method] = function (msg, ...splat) {
        this.log (method, msg, ...splat);
      };
    });
  }

  _can_proceed (lvl) {
    var lvl_num = _slave_logger.levels[lvl];
    if (lvl_num <= this._nlevel) return true;
    return false;
  }

  log (level, msg, ...splat) {
    if (!this._can_proceed (level)) return;

    const [meta] = splat;

    if (typeof meta === 'object' && meta !== null) {
      _slave_logger.log({
        level: level,
        message: msg,
        area: this._area,
        [SPLAT]: splat.slice(0),
        meta: meta
      });
    }
    else {
      _slave_logger.log({
        level: level,
        message: msg,
        area: this._area,
        [SPLAT]: splat
      });
    }
  }
}


//////////////////////////////////////////////////////////
function _get_level (area) {
  var area_steps = area.split(':');

  for (var i = area_steps.length; i > 0; i--) {
    var area_pref = area_steps.slice (0, i).join (':');
    var lvl = _config.level[area_pref];
    if (lvl) return lvl;
  }

  return _config.level.default || 'info';
}


//////////////////////////////////////////////////////////
function init (opts, cb) {
  if (!cb) {
    cb = opts;
    opts = {};
  }

  var cconf = new CC();
  var defaults = {
    level: {
      default: 'info'
    }
  };

  cconf
  .obj  (defaults)
  .obj  (opts)
  .env  ({prefix: 'LOG_'})
  .args ({prefix: 'log.'})
  .file (process.cwd() + '/log.js',       {ignore_missing: true})
  .file (process.cwd() + '/log-{env}.js', {ignore_missing: true})
  .file ('{wlsconfig:none}',              {ignore_missing: true})
  .env  ({prefix: 'LOG_'})
  .args ({prefix: 'log.'})
  .done (function (err, config) {
    if (err) return cb (err);
    _config = config;

    _slave_logger = winston.createLogger({
      level: 'silly',
      format: config.format || (winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(info => `${info.timestamp} [${info.area}] ${info.level}: ${info.message}`))),
      transports: config.transports || [new winston.transports.Console()]
    });

    cb ();
  });
}
                                                                                                                                                                                                                                                           

//////////////////////////////////////////////////////////
function logger (area) {
  if (_loggers[area]) return _loggers[area];

  var lvl = _get_level (area);
  var l = new WrapLogger ({
    level: lvl,
    area: area
  });

  _loggers[area] = l;
  return l;
}

module.exports = {
  init:    init,
  logger:  logger,
  loggers: _loggers,
  winston: _slave_logger
};

