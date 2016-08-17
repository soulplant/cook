// TODO: Add semicolons.
export interface Ingredient {
  name: string
  quantity: Quantity
  recipe?: number
}

export interface IngredientList {
  name: string
  quantities: Quantity[]
  recipes: number[]
}

export interface Recipe {
  id: number
  name: string
  ingredients: Ingredient[]
}

export interface Section {
  header: string
  parts: string[][]
}

// A line in the shopping list.
export interface ShoppingListRow {
  // The ingredient and its quantities.
  ingredientList?: IngredientList
  // An arbitrary piece of text to accompany this row.
  // TODO: Replace this with the resolved list of recipes this row is
  // contributed by. Currently that is this field's only use.
  note?: string

  // If this is set then this object represents a header in a shopping list.
  // The header will be rendered instead of any ingredient.
  header?: string
}

// TODO: Make this a non-tuple type.
export type Quantity = [number, string] | any[];
