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

// TODO: Make this a non-tuple type.
export type Quantity = [number, string] | any[];
