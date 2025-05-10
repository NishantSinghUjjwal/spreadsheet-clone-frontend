export const getCellPosition = (cellId: string) => {
    return cellId.split('-').map(Number)
}

export const getSelectedCellsFromRange = (selectedRange: { start: [number, number], end: [number, number] } | null) => {

    if (!selectedRange?.start && !selectedRange?.end) return;


    const [startRow, startCol] = selectedRange.start || selectedRange.end;
    const [endRow, endCol] = selectedRange.end || selectedRange.start;

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

    return selectedIDs
  }

  export const calculateFormula = (type: string | null, values: number[]) => {
    if (type == 'SUM') {
      return calculateSum(values)
    }
    else if (type == 'AVG') {
      return calculateAvg(values)
    }
  }

  export const calculateSum = (values: number[]) => {
    let total = values.reduce((acc, cell) => {
      return acc + Number(cell)
    }, 0)

    return isNaN(total) ? 'ERROR' : total.toString()
  }

  export const calculateAvg = (values: number[]) => {
    let total = values.reduce((acc, cell) => {
      return acc + Number(cell)
    }, 0)
    const avg = total / values.length
    return isNaN(avg) ? 'ERROR' : avg.toString()
  }

  