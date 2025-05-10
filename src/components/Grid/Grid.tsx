import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Cell } from '../../App';
import { v4 as uuid } from 'uuid'
const Grid = (
    {
        cols,
        rows,
        grid,
        formulaCell,
        selectedCells,
        selectCell,
        onChangeCell,
        addRow,
        addCol
    }: {
        cols: number,
        rows: number,
        grid: Cell[][],
        formulaCell: { type: 'SUM' | 'AVG' | null, cell: Cell | null },
        selectedCells: string[],
        selectCell: (cell: Cell, row: number, col: number, shiftPressed: boolean, ctrlPressed: boolean) => void,
        onChangeCell: (id: string, value: string) => void,
        addRow: () => void,
        addCol: () => void
    }
) => {

    return (
    <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols},1fr)`,
      gridTemplateRows: `repeat(${rows},1fr)`,
      width: '100%',
      height: '100%'
    }}>
    {grid.map((row, rIndex) =>
      row.map((cell, cIndex) => {
        const data = formulaCell.cell && formulaCell.cell.id == cell.id ? { ...formulaCell.cell } : { ...cell }

        return (
          <div
            onClick={(e) => selectCell(cell, rIndex, cIndex, e.shiftKey, e.ctrlKey)}
            id={`cell_${cell.id}`}
            key={cIndex}
            className={twMerge(
              "border border-gray-300 w-full min-w-32 h-6 flex items-center hover:border-gray-500 cursor-default",
              selectedCells.includes(`${rIndex}-${cIndex}` || '') && "border-2 border-blue-600 bg-[#E8F3FD]",
              formulaCell.cell && selectedCells.includes(`${rIndex}-${cIndex}` || '') && "border-2 border-dashed border-green-500"
            )}
          >
            <input
              type="text"
              className={twMerge("w-full h-full px-1 outline-none border-none text-center text-xs bg-transparent")}
              style={data.styles}
              value={data.value}
              onChange={(e) => onChangeCell(`${rIndex}-${cIndex}`, e.target.value)}
            />
          </div>
        )
      })
    )}
  </div>
  )
}

export default Grid
