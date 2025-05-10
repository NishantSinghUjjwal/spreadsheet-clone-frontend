import React from 'react'
import { twMerge } from 'tailwind-merge'

const GridHeaderLayout = (
    {
        rows,
        cols,
        selectedCells,
        children
    }: {
        rows: number,
        cols: number,
        selectedCells: string[],
        children: React.ReactNode
    }
) => {
 
    const getColumnHeader = (col: number) => {
        console.log(col)

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
  return (
    <div className="flex h-full w-full">
    <div className="flex flex-col w-full">
      <div className="w-full h-full overflow-auto">
        <div className="flex w-full">
          {/* left header */}
          <div style={{ display: "grid", gridTemplateRows: `repeat(${rows + 1},1fr)`, height: '100%' }}>
            {Array.from({ length: rows + 1 }).map((_, cIndex) => {
              if (cIndex == 0) return (
                <div className="border bg-gray-200 w-10 h-6 flex items-center justify-center" key={`row_${cIndex}`}></div>
              )
              else return (
                <div
                  className={twMerge(
                    "border w-10 h-6 flex items-center justify-center bg-gray-100 text-gray-700 font-medium hover:bg-gray-200",
                    selectedCells.find(cell => cell.split('-')[0] == (cIndex - 1).toString()) && "border-2 bg-[#D8E4BC] text-black font-bold"
                  )}
                  key={`row_${cIndex}`}
                >
                  {cIndex}
                </div>
              )
            })}
          </div>
          <div className="flex flex-col w-full">

            {/* top header */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, width: '100%' }}>
              {Array.from({ length: cols }).map((_, cIndex) => {
                return (
                  <div
                    className={twMerge(
                      "border w-full min-w-10 h-6 flex items-center justify-center bg-gray-100 text-gray-700 font-medium hover:bg-gray-200",
                      selectedCells.find(cell => cell.split('-')[1] == cIndex.toString()) && "border-2 bg-[#D8E4BC] text-black font-bold"
                    )}
                    key={`col_${cIndex}`}
                  >
                    {getColumnHeader(cIndex + 1)}
                  </div>
                )
              })}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default GridHeaderLayout
