
export interface Cell {
    id: null | string,
    value: string;
    row?: number;
    col?: number;
    styles: {
      fontWeight: string;
      backgroundColor: string;
    };
    formula?: 'SUM' | 'AVG' | null
  }
  