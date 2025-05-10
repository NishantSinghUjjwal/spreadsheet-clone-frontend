import React from 'react'
import { twMerge } from 'tailwind-merge'
import useGridContext from '../hooks/useGridContext'
import { getColumnHeaderAlphabets } from '../utils'
const GridHeaderLayout = (
    {
        children
    }: {
        children: React.ReactNode
    }
) => {
 
    const {rows, cols, selectedCells} = useGridContext()
   
  return (
        <div className="flex w-full overflow-auto">
          {/* Row Index */}
          <div style={{ display: "grid", gridTemplateRows: `repeat(${rows + 1},1fr)`, height: '100%' }}>
            {Array.from({ length: rows + 1 }).map((_, cIndex) => {
              if (cIndex == 0) return (
                <div className="border bg-gray-200 w-10 h-6 flex items-center justify-center" key={`row_${cIndex}`}></div>
              )
              else return (
                <div
                  className={twMerge(
                    "border w-10 h-6 flex items-center justify-center bg-gray-100 text-gray-700 font-medium hover:bg-gray-200",
                    selectedCells.find(cell => cell.split('-')[0] == (cIndex - 1).toString()) && "border-2 bg-[#217346] text-white font-bold"
                  )}
                  key={`row_${cIndex}`}
                >
                  {cIndex}
                </div>
              )
            })}
          </div>

          <div className="flex flex-col w-full">

            {/* Column Index */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, width: '100%' }}>
              {Array.from({ length: cols }).map((_, cIndex) => {
                return (
                  <div
                    className={twMerge(
                      "border w-full min-w-32 h-6 flex items-center justify-center bg-gray-100 text-gray-700 font-medium hover:bg-gray-200",
                      selectedCells.find(cell => cell.split('-')[1] == cIndex.toString()) && "border-2 bg-[#217346] text-white font-bold"
                    )}
                    key={`col_${cIndex}`}
                  >
                    {getColumnHeaderAlphabets(cIndex + 1)}
                  </div>
                )
              })}
            </div>
            {children}
          </div>
        </div>
  )
}

export default GridHeaderLayout
