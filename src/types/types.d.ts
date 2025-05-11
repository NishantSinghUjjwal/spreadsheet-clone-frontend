import { FORMULA_TYPES } from "../utils/constants";

export type FormulaType = typeof FORMULA_TYPES[keyof typeof FORMULA_TYPES];

export interface Cell {
    value: string;
    styles: {
      fontWeight: string;
      backgroundColor: string;
    };  
    formula: FormulaType|null
  }
  