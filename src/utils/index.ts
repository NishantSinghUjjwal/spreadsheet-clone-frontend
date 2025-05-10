import { FormulaType } from "../types/types";

export const getCellPosition = (cellId: string): [number, number] => {
  return cellId.split('-').map(Number) as [number, number]
}

export const getSelectedCellsFromRange = (
  selectedRange: { start: [number, number]; end: [number, number] } | null
) => {
    if (!selectedRange) return;

    const [startRow, startCol] = selectedRange.start;
    const [endRow, endCol] = selectedRange.end;

    const top = Math.min(startRow, endRow);
    const bottom = Math.max(startRow, endRow);
    const left = Math.min(startCol, endCol);
    const right = Math.max(startCol, endCol);

    const selectedIDs: string[] = [];

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            selectedIDs.push(`${r}-${c}`);
        }
    }

    return selectedIDs;
};


export const calculateFormula = (type: FormulaType | null, values: number[]) => {
  if (type == 'SUM') {
    return calculateSum(values)
  }
  else if (type == 'AVG') {
    return calculateAvg(values)
  }
  else throw new Error('Invalid formula type')
}

export const calculateSum = (values: number[]) => {
  let total = values.reduce((acc, cell) => {
    return acc + Number(cell)
  }, 0)

  if (isNaN(total)) throw new Error('Value is not a number')
  return total
}

export const calculateAvg = (values: number[]) => {
  let total = values.reduce((acc, cell) => {
    return acc + Number(cell)
  }, 0)
  const avg = total / values.length
  if (isNaN(avg)) throw new Error('Value is not a number')
  return avg
}


export const getColumnHeaderAlphabets = (col: number) => {

  //if alphabets end, we will use AA,BB
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const result = []
  while (col > 0) {
    col--; //use 0 index logic
    result.push(letters[col % 26])
    col = Math.floor(col / 26)
  }
  return result.reverse().join('')
}