import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Cell } from '../../types/types';
import { v4 as uuid } from 'uuid'
import useGridContext from '../../hooks/useGridContext'
import { Calculator } from 'lucide-react'
const Grid = () => {

    const {cols, rows, grid, formulaCell, selectedCells, selectCell, onChangeCellValue} = useGridContext()

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
        const data = formulaCell?.cell && formulaCell.cell.id == cell.id ? { ...formulaCell.cell } : { ...cell }
        const isFormula = !!data.formula

        return (
          <div
            onClick={(e) => selectCell(rIndex, cIndex, e.shiftKey)}
            id={`cell_${cell.id}`}
            key={cIndex}
            className={twMerge(
              "border border-gray-300 w-full min-w-32 h-6 flex items-center hover:border-gray-500 cursor-default relative",
              selectedCells.includes(`${rIndex}-${cIndex}` || '') && "border-2 border-blue-600 bg-[#E8F3FD]",
              formulaCell?.cell && selectedCells.includes(`${rIndex}-${cIndex}` || '') && "border-2 border-dashed border-green-500"
            )}
          >
            {isFormula && (
              <div className="absolute right-0 top-0 p-0.5 text-green-600 text-[8px] w-fit">
              {data.formula}
              </div>
            )}
            <input
              type="text"
              className={twMerge(
                "w-full h-full px-1 outline-none border-none text-center text-xs bg-transparent",
                isFormula && "pl-3"
              )}
              style={data.styles}
              value={data.value}
              onChange={(e) => onChangeCellValue(`${rIndex}-${cIndex}`, e.target.value)}
            />
          </div>
        )
      })
    )}
  </div>
  )
}

export default Grid
