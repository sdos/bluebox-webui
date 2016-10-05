var ColorMapper, LogColorMapper, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ColorMapper = require("./color_mapper");

LogColorMapper = (function(superClass) {
  extend(LogColorMapper, superClass);

  function LogColorMapper() {
    return LogColorMapper.__super__.constructor.apply(this, arguments);
  }

  LogColorMapper.prototype.type = "LogColorMapper";

  LogColorMapper.prototype._get_values = function(data, palette) {
    var d, high, i, key, len, log, low, max_key, n, ref, ref1, scale, values;
    n = palette.length;
    low = (ref = this.get('low')) != null ? ref : _.min(data);
    high = (ref1 = this.get('high')) != null ? ref1 : _.max(data);
    scale = n / (Math.log1p(high) - Math.log1p(low));
    max_key = palette.length - 1;
    values = [];
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      if (isNaN(d)) {
        values.push(this.nan_color);
        continue;
      }
      if (d > high) {
        d = high;
      }
      if (d < low) {
        d = low;
      }
      log = Math.log1p(d) - Math.log1p(low);
      key = Math.floor(log * scale);
      if (key > max_key) {
        key = max_key;
      }
      values.push(palette[key]);
    }
    return values;
  };

  return LogColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LogColorMapper
};
