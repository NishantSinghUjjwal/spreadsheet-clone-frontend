export type FormulaType = 'SUM' | 'AVG'

export interface Cell {
    value: string;
    styles: {
      fontWeight: string;
      backgroundColor: string;
    };  
    formula: FormulaType|null
  }
  