import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import useGridContext from '../hooks/useGridContext'
const Grid = () => {

    const {cols, rows, grid, selectedFormulaCell, selectedCells, selectCell, onChangeCellValue} = useGridContext()
    
    // Focus input when cell is selected
    useEffect(() => {
      if (selectedCells.length === 1) {
        const selectedId = selectedCells[0]
        // Use querySelector to find the input within the selected cell
        const cellElement = document.getElementById(`cell_${selectedId}`)
        if (cellElement) {
          const inputElement = cellElement.querySelector('input')
          if (inputElement) {
            inputElement.focus()
          }
        }
      }
    }, [selectedCells])

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

        const cellId = `${rIndex}-${cIndex}`
        const isFormula = !!cell.formula
        const isUsedInFormula = selectedFormulaCell?.id && selectedCells.includes(cellId)
        const isSelected = selectedCells.includes(cellId)
        const isSelectedFormulaCell = selectedFormulaCell?.id == cellId
        const selectedFormulaCellType = isSelectedFormulaCell ? selectedFormulaCell.type : null // this is for showing temperary text in formula cell such as SUM or AVG
        return (
          <div
            onClick={(e) => selectCell(rIndex, cIndex, e.shiftKey)}
            id={`cell_${cellId}`}
            key={cIndex}
            className={twMerge(
              "border border-gray-300 w-full min-w-32 h-6 flex items-center hover:border-gray-500 cursor-default relative",
              isSelected && "border-2 border-blue-600 bg-[#E8F3FD]",
              isUsedInFormula && "border-2 border-dashed border-green-500",
              isSelectedFormulaCell && "border-2 border-dashed border-black bg-slate-300"
            )}
          >
            {/* styles for formula cell */}
            {isFormula && (
              <div className="absolute right-0 top-0 p-0.5 text-green-600 text-[8px] w-fit">
              {cell.formula}
              </div>
            )}
            <input
              type="text"
              className={twMerge(
                "w-full h-full px-1 outline-none border-none text-center text-xs bg-transparent",
                cell.formula && "pl-3"
              )}
              style={cell.styles}
              value={ selectedFormulaCellType|| cell.value}
              onChange={(e) => onChangeCellValue(rIndex, cIndex, e.target.value)}
            />
          </div>
        )
      })
    )}
  </div>
  )
}

export default Grid
