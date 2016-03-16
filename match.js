var _ = require('lodash');

var toType = function(obj){
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

var defaults = {

};

var match = {
  'string': function(str, value, options){
    if(options.exact || _.isEmpty(value)){
      return str.toLowerCase() === value;
    }
    return str.toLowerCase().indexOf( value ) !== -1;
  },

  'number': function(number, value, options){
    if(options.exact){
      return number.toString() === value;
    }
    return number.toString().indexOf( value ) !== -1;
  },

  'boolean': function(bool, value){
    return bool.toString() === value;
  },

  'array': function(array, value, options){
    var self = this;
    return _.some(array, function(elem){
      var type = toType(elem);
      return self[type](elem, value, options);
    });
  }
};

module.exports = function(haystack, needle, options){
  var opts = _.defaults({}, options, defaults);
  var type = toType(haystack);
  if(match[type]){
    return match[type](haystack, needle, opts);
  }
};