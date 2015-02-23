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

describe('Formatting', function() {
  it('figures out quarters for quantities', function() {
    expect(formatQuantity([3.75, 'kg'])).toEqual('3 3/4 kg');
    expect(formatQuantity([3.78, 'kg'])).toEqual('3 3/4 kg');
    expect(formatQuantity([2.0, 'kg'])).toEqual('2 kg');
    expect(formatQuantity([2.26, 'kg'])).toEqual('2 1/4 kg');
    expect(formatQuantity([2.5, 'kg'])).toEqual('2 1/2 kg');
    expect(formatQuantity([0.5, 'kg'])).toEqual('1/2 kg');
  });
});

function getQuantity(name, ingredients) {
  for (var i = 0; i < ingredients.length; i++) {
    if (ingredients[i].name == name) {
      return ingredients[i].quantities;
    }
  }
  return null;
}

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

  it('Compiles a list of ingredients correctly', function() {
    var ingredients = getIngredientList(recipes);
    expect(ingredients.length).toEqual(4);
    expect(getQuantity('tinned tomato', ingredients)).toEqual([[6, 'can']]);
    expect(getQuantity('garlic', ingredients)).toEqual([[2.5, 'clove']]);
    expect(getQuantity('salt', ingredients)).toEqual([]);
  });
});
