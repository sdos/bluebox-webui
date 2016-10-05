var ColorMapper, LinearColorMapper, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ColorMapper = require("./color_mapper");

LinearColorMapper = (function(superClass) {
  extend(LinearColorMapper, superClass);

  function LinearColorMapper() {
    return LinearColorMapper.__super__.constructor.apply(this, arguments);
  }

  LinearColorMapper.prototype.type = "LinearColorMapper";

  LinearColorMapper.prototype._get_values = function(data, palette) {
    var d, i, key, len, max, max_key, min, norm_factor, normed_d, normed_interval, ref, ref1, values;
    min = (ref = this.get('low')) != null ? ref : _.min(data);
    max = (ref1 = this.get('high')) != null ? ref1 : _.max(data);
    max_key = palette.length - 1;
    values = [];
    norm_factor = 1 / (max - min);
    normed_interval = 1 / palette.length;
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      if (isNaN(d)) {
        values.push(this.nan_color);
        continue;
      }
      normed_d = (d - min) * norm_factor;
      key = Math.floor(normed_d / normed_interval);
      if (key < 0) {
        key = 0;
      } else if (key >= max_key) {
        key = max_key;
      }
      values.push(palette[key]);
    }
    return values;
  };

  return LinearColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LinearColorMapper
};
