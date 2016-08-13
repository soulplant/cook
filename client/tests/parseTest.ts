/// <reference path="typings/jasmine/jasmine.d.ts" />

import { parseNumber, Parser, parseRecipes } from '../src/parser';

describe('parseNumber', function() {
  it('handles halves', function() {
    expect(parseNumber('1/2')).toEqual(0.5);
  });
});

describe('Parser', function() {
  var measurements = [
    'g',
    'kg',
  ];

  var parser = new Parser(measurements);
  it('parses ingredients', function() {
    var cases = [
      ['3 kg tomato', {quantity: [3, 'kg'], name: 'tomato'}],
      ['15 g chili flakes', {quantity: [15, 'g'], name: 'chili flakes'}],
      ['salt', {quantity: [], name: 'salt'}],
    ];
    cases.forEach(function(c) {
      expect(parser.parseIngredient(c[0])).toEqual(c[1]);
    });
  });
});

describe('Integration', function() {
  var recipesText = [
    '= Tomato Soup =',
    'Simple tomato soup',
    '',
    '2 can tinned tomato',
    '2 clove garlic',
    'olive oil',
    'salt',
    '',
    '',
    '= Tinned Tomatoes =',
    'Tinned tomatoes for dinner!',
    '',
    '4 can tinned tomato',
    '1/2 clove garlic',
    'salt',
  ].join('\n');

  var measurementsText = [
    'can',
    'clove',
  ].join('\n');

  var recipes = parseRecipes(recipesText, measurementsText);
  it('Parses data from the server correctly', function() {
    expect(recipes.length).toEqual(2);
    expect(recipes[0].name).toEqual('Tomato Soup');
    expect(recipes[1].name).toEqual('Tinned Tomatoes');
  });
});
