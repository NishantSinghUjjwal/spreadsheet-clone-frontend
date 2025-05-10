export type FormulaType = 'SUM' | 'AVG'

export interface Cell {
    id: null | string,
    value: string;
    row?: number;
    col?: number;
    styles: {
      fontWeight: string;
      backgroundColor: string;
    };  
    formula: FormulaType|null
  }
  