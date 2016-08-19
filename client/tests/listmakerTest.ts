import { getIngredientList, mergeQuantities, mergeIngredients } from '../src/listmaker';
import { parseRecipes } from '../src/parser';

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
  '2 tomato',
  '4 can tinned tomato',
  '1/2 clove garlic',
  'salt',
].join('\n');

var measurementsText = [
  'can',
  'clove',
].join('\n');

function getQuantity(name, ingredients) {
  for (var i = 0; i < ingredients.length; i++) {
    if (ingredients[i].name == name) {
      return ingredients[i].quantities;
    }
  }
  return null;
}

describe('List Construction', function() {
  var recipes = parseRecipes(recipesText, measurementsText);
  it('Compiles a list of ingredients correctly', function() {
    var ingredients = getIngredientList(recipes);
    expect(ingredients.length).toEqual(5);
    // TODO: Add a test for multiple measures of the same ingredient.
    expect(getQuantity('tomato', ingredients)).toEqual([[2, '']]);
    expect(getQuantity('tinned tomato', ingredients)).toEqual([[6, 'can']]);
    expect(getQuantity('garlic', ingredients)).toEqual([[2.5, 'clove']]);
    expect(getQuantity('salt', ingredients)).toEqual([]);
  });
});
describe('mergeQuantities', function() {
  it('merges unnamed ingredients correctly', function() {
    expect(mergeQuantities([[2, '']])).toEqual([[2, '']]);
  });
});

describe('mergeIngredients', function() {
  it('merges ingredients correctly', function() {
    var eggs = {
      name: 'egg',
      quantity: [2, ''],
    };
    var il = mergeIngredients([eggs, eggs]);
    expect(il[0].quantities).toEqual([[4, '']]);
  })
});
