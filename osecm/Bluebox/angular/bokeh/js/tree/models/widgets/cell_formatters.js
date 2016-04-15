var $, BooleanFormatter, CellFormatter, DateFormatter, HTMLTemplateFormatter, Model, NumberFormatter, Numeral, StringFormatter, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

Numeral = require("numeral");

Model = require("../../model");

CellFormatter = (function(superClass) {
  extend(CellFormatter, superClass);

  function CellFormatter() {
    return CellFormatter.__super__.constructor.apply(this, arguments);
  }

  CellFormatter.prototype.formatterDefaults = {};

  CellFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    if (value === null) {
      return "";
    } else {
      return (value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  };

  CellFormatter.prototype.defaults = function() {
    return _.extend({}, CellFormatter.__super__.defaults.call(this), this.formatterDefaults);
  };

  return CellFormatter;

})(Model);

StringFormatter = (function(superClass) {
  extend(StringFormatter, superClass);

  function StringFormatter() {
    return StringFormatter.__super__.constructor.apply(this, arguments);
  }

  StringFormatter.prototype.type = 'StringFormatter';

  StringFormatter.prototype.formatterDefaults = {
    text_color: null
  };

  StringFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    var font_style, text, text_align, text_color;
    text = StringFormatter.__super__.format.call(this, row, cell, value, columnDef, dataContext);
    font_style = this.get("font_style");
    text_align = this.get("text_align");
    text_color = this.get("text_color");
    if ((font_style != null) || (text_align != null) || (text_color != null)) {
      text = $("<span>" + text + "</span>");
      switch (font_style) {
        case "bold":
          text = text.css("font-weight", "bold");
          break;
        case "italic":
          text = text.css("font-style", "italic");
      }
      if (text_align != null) {
        text = text.css("text-align", text_align);
      }
      if (text_color != null) {
        text = text.css("color", text_color);
      }
      text = text.prop('outerHTML');
    }
    return text;
  };

  return StringFormatter;

})(CellFormatter);

NumberFormatter = (function(superClass) {
  extend(NumberFormatter, superClass);

  function NumberFormatter() {
    return NumberFormatter.__super__.constructor.apply(this, arguments);
  }

  NumberFormatter.prototype.type = 'NumberFormatter';

  NumberFormatter.prototype.formatterDefaults = {
    font_style: "normal",
    text_align: "left",
    text_color: null,
    format: '0,0',
    language: 'en',
    rounding: 'round'
  };

  NumberFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    var format, language, rounding;
    format = this.get("format");
    language = this.get("language");
    rounding = (function() {
      switch (this.get("rounding")) {
        case "round":
        case "nearest":
          return Math.round;
        case "floor":
        case "rounddown":
          return Math.floor;
        case "ceil":
        case "roundup":
          return Math.ceil;
      }
    }).call(this);
    value = Numeral.format(value, format, language, rounding);
    return NumberFormatter.__super__.format.call(this, row, cell, value, columnDef, dataContext);
  };

  return NumberFormatter;

})(StringFormatter);

BooleanFormatter = (function(superClass) {
  extend(BooleanFormatter, superClass);

  function BooleanFormatter() {
    return BooleanFormatter.__super__.constructor.apply(this, arguments);
  }

  BooleanFormatter.prototype.type = 'BooleanFormatter';

  BooleanFormatter.prototype.formatterDefaults = {
    icon: 'check'
  };

  BooleanFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    if (!!value) {
      return $('<i>').addClass(this.get("icon")).html();
    } else {
      return "";
    }
  };

  return BooleanFormatter;

})(CellFormatter);

DateFormatter = (function(superClass) {
  extend(DateFormatter, superClass);

  function DateFormatter() {
    return DateFormatter.__super__.constructor.apply(this, arguments);
  }

  DateFormatter.prototype.type = 'DateFormatter';

  DateFormatter.prototype.formatterDefaults = {
    format: 'yy M d'
  };

  DateFormatter.prototype.getFormat = function() {
    var format, name;
    format = this.get("format");
    name = (function() {
      switch (format) {
        case "ATOM":
        case "W3C":
        case "RFC-3339":
        case "ISO-8601":
          return "ISO-8601";
        case "COOKIE":
          return "COOKIE";
        case "RFC-850":
          return "RFC-850";
        case "RFC-1036":
          return "RFC-1036";
        case "RFC-1123":
          return "RFC-1123";
        case "RFC-2822":
          return "RFC-2822";
        case "RSS":
        case "RFC-822":
          return "RFC-822";
        case "TICKS":
          return "TICKS";
        case "TIMESTAMP":
          return "TIMESTAMP";
        default:
          return null;
      }
    })();
    if (name != null) {
      return $.datepicker[name];
    } else {
      return format;
    }
  };

  DateFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    var date;
    value = _.isString(value) ? parseInt(value, 10) : value;
    date = $.datepicker.formatDate(this.getFormat(), new Date(value));
    return DateFormatter.__super__.format.call(this, row, cell, date, columnDef, dataContext);
  };

  return DateFormatter;

})(CellFormatter);

HTMLTemplateFormatter = (function(superClass) {
  extend(HTMLTemplateFormatter, superClass);

  function HTMLTemplateFormatter() {
    return HTMLTemplateFormatter.__super__.constructor.apply(this, arguments);
  }

  HTMLTemplateFormatter.prototype.type = 'HTMLTemplateFormatter';

  HTMLTemplateFormatter.prototype.formatterDefaults = {
    template: '<%= value %>'
  };

  HTMLTemplateFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
    var compiled_template, template;
    template = this.get("template");
    if (value === null) {
      return "";
    } else {
      dataContext = _.extend({}, dataContext, {
        value: value
      });
      compiled_template = _.template(template);
      return compiled_template(dataContext);
    }
  };

  return HTMLTemplateFormatter;

})(CellFormatter);

module.exports = {
  String: {
    Model: StringFormatter
  },
  Number: {
    Model: NumberFormatter
  },
  Boolean: {
    Model: BooleanFormatter
  },
  Date: {
    Model: DateFormatter
  },
  HTMLTemplate: {
    Model: HTMLTemplateFormatter
  }
};
