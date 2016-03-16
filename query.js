var _ = require('lodash');
var match = require('./match');

var defaults = {
  fields: ['title'] // json property to use for simple string search
};

var methods = {

  string: function(json, filter, options) {
    var fields = _.isArray(options.fields) ? options.fields : [options.fields];
    var needle = filter.query ? filter.query.toLowerCase() : '';

    var haystacks = _.chain(fields)
      .map(function (key) {
        return _.get(json, key); // allows nested get
      })
      .value();

    return _.some(haystacks, function (haystack) {
      return match(haystack, needle, options);
    });
  },

  prefix: function(json, filter){
    return this.string(json, filter, {fields: filter.prefix});
  },

  or: function(json, filter, options){
    var self = this;
    return _.some(filter.queries, function(query){
      return self[query.type](json, query, options);
    });
  }

};

module.exports = function(json, filterArray, options) {
  var opts = _.defaults({}, options, defaults);

  if (!_.isArray(filterArray)) {
    filterArray = [{type: 'string', query: filterArray}];
  }

  // todo: every = AND, some = OR
  return _.every(filterArray, function (filter) {
    return methods[filter.type](json, filter, opts);
  });
};