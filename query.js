var _ = require('lodash');
var match = require('./match');

var defaults = {
  fields: ['title'] // json property to use for simple string search
};

var pick = function(json, props){
  return _.chain(props)
    .map(function (key) {
      return _.get(json, key); // allows nested get
    })
    .value();
};

var methods = {

  string: function(json, filter, options) {
    var fields = _.isArray(options.fields) ? options.fields : [options.fields];
    var needle = filter.query ? filter.query.toLowerCase() : '';
    var haystacks = pick(json, fields);

    return _.some(haystacks, function (haystack) {
      return match(haystack, needle, options);
    });
  },

  prefix: function(json, filter){
    return this.string(json, filter, {fields: filter.prefix});
  },

  range: function(json, filter, options){
    var fields = _.isArray(options.fields) ? options.fields : [options.fields];
    var haystacks = pick(json, fields);

    return _.some(haystacks, function (haystack) {
      return _.inRange(haystack, filter.from, filter.to);
    });
  },

  prange: function(json, filter){
    return this.range(json, filter, {fields: filter.prefix});
  },

  or: function(json, filter, options){
    var self = this;
    return _.some(filter.queries, function(query){
      return self[query.type](json, query, options);
    });
  },

  and: function(json, filter, options){
    var self = this;
    return _.every(filter.queries, function(query){
      return self[query.type](json, query, options);
    });
  }

};

module.exports = function(json, filterArray, options) {
  var opts = _.defaults({}, options, defaults);

  if (!_.isArray(filterArray)) {
    filterArray = [{type: 'string', query: filterArray.toString()}];
  }

  return _.every(filterArray, function (filter) {
    return methods[filter.type](json, filter, opts);
  });
};