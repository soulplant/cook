import { Ingredient, IngredientList, Quantity, Section, Recipe, Aisle } from './types';

// TODO: Make a class and put the various parse* functions on it as static methods.

function trimHeader(str: string): string {
  return str.substring(1, str.length - 1).trim();
}

// Returns true if the line represents a section header.
function isHeader(line: string): boolean {
  return line.charAt(0) == '=';
}

// A section is a header followed by one or more runs of non-empty lines.
//
// For example:
//
// = Section Header =
// Part1
// Part1
//
// Part2
// Part2
//
// This function parses runs of sections delimited by double newlines.
export function parseSections(text: string): Section[] {
  if (!text) {
    return;
  }
  var lines = text.split('\n');
  var sections = [];
  var section: Section = null;
  var part: string[] = [];
  for (var i in lines) {
    var line = lines[i];
    if (section != null) {
      if (line.length > 0) {
        part.push(line);
        continue;
      }
      // Line is empty so we are done with this part.

      // Part is empty, this means this is the second empty line we've
      // encountered in a row, so we're done with this section.
      if (part.length == 0) {
        sections.push(section);
        section = null;
      } else {
        section.parts.push(part);
        part = [];
      }
    } else {
      part.push(line);
    }
    if (isHeader(line)) {
      section = {header: trimHeader(line), parts: []};
      part = [];
    }
  }
  if (part.length > 0) {
    section.parts.push(part);
  }
  if (section != null) {
    sections.push(section);
  }
  return sections;
}

export function parseRecipes(recipesText: string, measurementsText: string): Recipe[] {
  var sections = parseSections(recipesText);
  var parser = new IngredientParser(measurementsText.split('\n'));

  var recipes: Recipe[] = [];
  for (var i = 0; i < sections.length; i++) {
    var parseIngredient: (line: string) => Ingredient = parser.parseIngredient.bind(parser);
    var f = parser.parseIngredient;
    recipes.push({
      id: i,
      name: sections[i].header,
      ingredients: sections[i].parts[1].map(parseIngredient),
    });
  }
  return recipes;
}

export function parseAisles(aislesText: string): Aisle[] {
  var result: Aisle[] = [];
  var sections = parseSections(aislesText);
  sections.forEach(function(section) {
    result.push({name: section.header, ingredientNames: section.parts[0]});
  });
  return result;
}

// Visible for testing.
export class IngredientParser {
  private measurements: string[];

  public constructor(measurements: string[]) {
    this.measurements = measurements;
  }

  private isMeasurement(word: string): boolean {
    return this.measurements.indexOf(word) != -1;
  }

  public parseIngredient(line: string): Ingredient {
    if (line == '') {
      return null;
    }
    var words = line.split(' ');
    if (words.length == 0) {
      return null;
    }
    var number = undefined;
    if (/^[0-9\/]+$/.test(words[0])) {
      number = parseNumber(words[0]);
      if (isNaN(number)) {
        throw "failed to parse '" + line + "'";
      }
      words = words.slice(1);
      if (words.length == 0) {
        return null;
      }
    }
    var measurement = '';
    if (this.isMeasurement(words[0])) {
      measurement = words[0];
      words = words.slice(1);
      if (words.length == 0) {
        return null;
      }
    }
    var name = words.join(' ');
    var quantity: Quantity = [];
    if (number !== undefined) {
      quantity = [number, measurement];
    }
    return {
      quantity: quantity,
      name: name,
    };
  }
}

// Visible for testing.
export function parseNumber(str: string): number {
  if (str.indexOf('/') != -1) {
    return eval(str);
  }
  return parseInt(str);
}
