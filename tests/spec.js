var Parser = require('query-parser');
var parse = new Parser();
var query = require('../query');

var json = {
  title: 'Woo Logo Hy-phen "spécîäl" доступ مدفوع',
  id: 50,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisi velit, finibus eu auctor in, dapibus quis odio. In at purus eleifend, suscipit libero sit amet, porttitor dolor.',
  bool: true,
  boolean: false,
  barcode: 'SKU12345',
  empty: '',
  address: {
    country: 'US',
    postcode: 90210
  },
  categories: [
    'Music',
    'Posters'
  ],
  complex: [{
    name: 'Color',
    slug: 'color',
    option: 'Black'
  },{
    name: 'Size',
    slug: 'size',
    option: 'XL'
  }],
  variable: [{
    name: 'Color',
    slug: 'color',
    variation: true,
    options: [
      'Black',
      'Green'
    ]
  },{
    name: 'Size',
    slug: 'size',
    variation: true,
    options: [
      'S', 'M', 'L'
    ]
  }]
};

describe('simple string queries, eg: [{query:"woo",type:"string"}]', function() {

  it('should match simple query on title', function () {
    query(json, parse('woo')).should.be.true;
    query(json, parse('foo')).should.be.false;
  });

  it('should match capitalized query on title', function () {
    query(json, parse('WOO')).should.be.true;
    query(json, parse('Log')).should.be.true;
  });

  it('should match spaced query on title', function () {
    query(json, parse('woo lo')).should.be.true;
    query(json, parse('woo phen')).should.be.true;
    query(json, parse('"woo phen"')).should.be.false;
  });

  it('should match dashed query on title', function () {
    query(json, parse('hy-phen')).should.be.true;
  });

  it('should match special characters query on title', function () {
    query(json, parse('spéc')).should.be.true;
  });

  it('should match foreign characters query on title', function () {
    query(json, parse('مدفوع')).should.be.true;
  });

  it('should match attribute using field option', function(){
    query(json, parse('ipsum'), { fields: ['description'] }).should.be.true;
    query(json, parse('ipsum'), { fields: 'description' }).should.be.true;
  });

});

describe('simple prefix queries, eg: [{prefix:"barcode",type:"prefix",query:"sku12345"}]', function(){

  it('should match an attribute with string value', function () {
    query(json, parse('barcode:sku12345')).should.be.true;
    query(json, parse('barcode:sku')).should.be.true;
    query(json, parse('barcode:')).should.be.false;
    query(json, parse('empty:')).should.be.true;
  });

  it('should match an attribute with numeric value', function () {
    query(json, parse('id:50')).should.be.true;
    query(json, parse('id:5')).should.be.true;
    query(json, parse('id:6')).should.be.false;
  });

  it('should match an attribute with boolean value', function () {
    query(json, parse('bool:true')).should.be.true;
    query(json, parse('bool:false')).should.be.false;
    query(json, parse('bool:tru')).should.be.false;
    query(json, parse('boolean:TRUE')).should.be.false;
    query(json, parse('boolean:FALSE')).should.be.true;
    query(json, parse('boolean:FAL')).should.be.false;
    query(json, parse('bool:1')).should.be.false;
  });

  it('should match an attribute with an array value', function () {
    query(json, parse('categories:Music')).should.be.true;
    query(json, parse('categories:Mus')).should.be.true;
    query(json, parse('categories:posters')).should.be.true;
    query(json, parse('categories:woo')).should.be.false;
  });

});

describe('simple OR queries, eg: [{type:"or",queries:[{query:"woo",type:"string"},{query:"foo",type:"string"}]}]', function(){

  it('should match piped queries on title', function () {
    query(json, parse('woo|foo')).should.be.true;
    query(json, parse('foo|bar')).should.be.false;
  });

  it('should match piped queries on attribute', function () {
    query(json, parse('id:50|id:6')).should.be.true;
    query(json, parse('id:1|id:7')).should.be.false;
  });

});

describe('nested queries, eg: [{prefix:"address.postcode",type:"prefix",query:"90210"}]', function(){

  it('should match nested properties using prefix', function(){
    query(json, parse('address.postcode:90210')).should.be.true;
    query(json, parse('address.postcode:90')).should.be.true;
    query(json, parse('barcode:90|address.postcode:90')).should.be.true;
    query(json, parse('barcode:90|address.postcode:123')).should.be.false;
  });

  it('should match nested properties using fields option', function(){
    query(json, parse('90210'), { fields: ['address.postcode'] }).should.be.true;
    query(json, parse('90'), { fields: 'address.postcode' }).should.be.true;
    query(json, parse('123'), { fields: ['barcode', 'address.postcode'] }).should.be.true;
    query(json, parse('woo'), { fields: ['barcode', 'address.postcode'] }).should.be.false;
  });

});

describe('simple AND queries, eg: [{type:"and",queries:[{query:"woo",type:"string"},{prefix:"address.postcode",type:"prefix",query:"90210"}]}]', function(){

  it('should match AND queries', function () {
    query(json, parse('(woo address.postcode:90210)')).should.be.true;
    query(json, parse('(foo address.postcode:90210)')).should.be.false;
  });

});

describe('simple range queries, eg: [{"type":"range","from":"10","to":"20"}]', function(){

  it('should match range queries', function () {
    query(json, parse('45-55'), {fields: 'id'}).should.be.true;
    query(json, parse('55-65'), {fields: 'id'}).should.be.false;
    query(json, parse('50-60'), {fields: 'id'}).should.be.true;
    query(json, parse('40-50'), {fields: 'id'}).should.be.false; // as per _.inRange
  });

  it('should match prefixed range queries', function () {
    query(json, parse('address.postcode:90000-99999')).should.be.true;
    query(json, parse('address.postcode:80000-90000')).should.be.false;
  });

});