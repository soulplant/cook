import { Ingredient, IngredientList, Quantity, Section, Recipe } from './types';

function trimHeader(str: string): string {
  return str.substring(1, str.length - 1).trim();
}

export function parseSections(text: string): Section[] {
  if (!text) {
    return;
  }
  var lines = text.split('\n');
  var sections = [];
  var i = 0;
  while (true) {
    while (i < lines.length && lines[i].charAt(0) != '=') {
      i++;
    }
    if (i >= lines.length) {
      break;
    }
    var section: Section = {
      header: trimHeader(lines[i]),
      parts: [],
    };
    i++;

    while (true) {
      var buf = [];
      while (i < lines.length && lines[i] != '') {
        buf.push(lines[i]);
        i++;
      }
      section.parts.push(buf);
      if (i >= lines.length) {
        break;
      }
      i++;
      if (i >= lines.length) {
        break;
      }
      if (lines[i] == '') {
        break;
      }
    }
    sections.push(section);
  }
  return sections;
}

export function parseRecipes(recipesText: string, measurementsText: string): Recipe[] {
  var sections = parseSections(recipesText);
  var parser = new Parser(measurementsText.split('\n'));

  var recipes: Recipe[] = [];
  for (var i = 0; i < sections.length; i++) {
    // TODO: Convert parser to a class so we know the type of
    // parser.parseIngredient and can avoid this indirection.
    var parseIngredient: (line: string) => Ingredient =
        function(line: string): Ingredient {
          return parser.parseIngredient(line);
        };
    recipes.push({
      id: i,
      name: sections[i].header,
      ingredients: sections[i].parts[1].map(parseIngredient),
    });
  }

  return recipes;
}

// Visible for testing.
export function Parser(measurements) {
  this.measurements = measurements;
}

Parser.prototype.isMeasurement = function(word) {
  return this.measurements.indexOf(word) != -1;
};

Parser.prototype.parseIngredient = function(line: string): Ingredient {
  if (line == '') {
    return null;
  }
  var words = line.split(' ');
  if (words.length == 0) {
    return null;
  }
  var number = undefined;
  var measurement = undefined;
  if (/^[0-9\/]+$/.test(words[0])) {
    number = parseNumber(words[0]);
    words = words.slice(1);
    if (words.length == 0) {
      return null;
    }
  }
  if (this.isMeasurement(words[0])) {
    measurement = words[0];
    words = words.slice(1);
    if (words.length == 0) {
      return null;
    }
  }
  var name = words.join(' ');
  var quantity: Quantity = [];
  if (number !== undefined && measurement) {
    quantity = [number, measurement];
  }
  return {
    quantity: quantity,
    name: name,
  };
};

// Visible for testing.
export function parseNumber(str: string): number {
  if (str.indexOf('/') != -1) {
    return eval(str);
  }
  return parseInt(str);
}
