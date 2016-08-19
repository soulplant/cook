/// <reference path="../typings/tsd.d.ts" />

import { Parser, IngredientParser } from '../src/parser';

describe('parseNumber', function() {
  it('handles halves', function() {
    expect(IngredientParser.parseNumber('1/2')).toEqual(0.5);
  });
});

describe('Parser', function() {
  var measurements = [
    'g',
    'kg',
  ];

  var parser = new IngredientParser(measurements);
  it('parses ingredients', function() {
    var cases: [string, any][] = [
      ['3 kg tomato', {quantity: [3, 'kg'], name: 'tomato'}],
      ['15 g chili flakes', {quantity: [15, 'g'], name: 'chili flakes'}],
      ['salt', {quantity: [], name: 'salt'}],
    ];
    cases.forEach(function(c) {
      expect(parser.parseIngredient(c[0])).toEqual(c[1]);
    });
  });
});

describe('parseSections', function() {
  it('parses sections correctly', function() {
    var sectionText = [
      '= Section 1 =',
      'Part1.1',
      'Part1.2',
      '',
      'Part2.1',
      '',
      '',
      '= Section 2 =',
      'Part1.1',
      'Part1.2',
      '',
      'Part2.1',
    ].join('\n');

    var sections = Parser.parseSections(sectionText);
    expect(sections.length).toBe(2);
    expect(sections[0].header).toEqual('Section 1');
    expect(sections[0].parts.length).toEqual(2);
    expect(sections[0].parts[0]).toEqual(['Part1.1', 'Part1.2']);
    expect(sections[1].header).toEqual('Section 2');
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

  var recipes = Parser.parseRecipes(recipesText, measurementsText);
  it('Parses data from the server correctly', function() {
    expect(recipes.length).toEqual(2);
    expect(recipes[0].name).toEqual('Tomato Soup');
    expect(recipes[0].ingredients.length).toEqual(4);
    expect(recipes[1].name).toEqual('Tinned Tomatoes');
    expect(recipes[1].ingredients.length).toEqual(3);
  });
});

describe('Ingredient Parser', function() {
  it('parses ingredients without a measurement correctly', function() {
    function test(line: string, expected: any[]) {
      var parser = new IngredientParser(['g']);
      var ingredient = parser.parseIngredient(line);
      expect(ingredient.quantity).toEqual(expected);
    }
    test('2 tomato', [2, '']);
    test('200 g flour', [200, 'g']);
  })
})
