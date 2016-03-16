var _ = require('lodash');

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

  'array': function(array, value){
    return _.some(array, function(elem){
      return elem.toLowerCase() === value;
    });
  }
};

module.exports = function(haystack, needle, options){
  var opts = _.defaults({}, options, defaults);
  var type = ({}).toString.call(haystack).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  if(match[type]){
    return match[type](haystack, needle, opts);
  }
};