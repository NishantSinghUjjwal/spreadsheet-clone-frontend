import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ColorPicker from './ColorPicker'
import useGridContext from '../hooks/useGridContext'
import { 
  Bold, 
  PaintBucket, 
  Upload,
  Calculator, 
  Download
} from 'lucide-react'

const Toolbar = () => {
    const {selectedCells, grid, changeCellBackground, changeFontWeight, onClickSum, onClickAvg, exportToJSON, importFromJSON} = useGridContext()
    const [showFillColorPicker, setShowFillColorPicker] = useState(false)

    const isAnyCellBold = selectedCells.some(cell =>{
        const [row, col] = cell.split('-').map(Number)
        const actualCell = grid[row][col]
        return actualCell.styles.fontWeight === 'bold'
    })
    
    return (
      <div className="flex gap-2 bg-gray-100 p-2 border-b border-gray-300 items-center">
          <div className="flex gap-2">
              <button 
                className={twMerge("p-1 px-2 bg-white border border-gray-300 rounded hover:bg-gray-200", isAnyCellBold && "bg-gray-200")} 
                onClick={changeFontWeight}
              >
                <Bold size={16} />
              </button>
              <div className="relative">
                  <button 
                    className="p-1 px-2 bg-white border border-gray-300 rounded hover:bg-gray-200 flex items-center" 
                    onClick={() => setShowFillColorPicker(prev => !prev)}
                  >
                    <PaintBucket size={16} />
                  </button>
                  {showFillColorPicker && (
                     <ColorPicker 
                       changeCellBackground={changeCellBackground}
                       onClose={() => setShowFillColorPicker(false)}
                     />
                  )}
              </div>
          </div>
          <div className="h-full border-r border-gray-300 mx-2"></div>
          <div className="flex gap-2">
              <button className="p-1 md:px-3 bg-white border border-gray-300 rounded hover:bg-gray-200 flex items-center md:gap-1" onClick={onClickSum}>
                <span className='hidden md:flex items-center gap-1'>
                <Calculator size={16} />
                <span className="md:inline">SUM</span>
                </span>
                <span className='flex md:hidden items-center gap-1 text-xs'>
                 SUM
                </span>
              </button>
              <button className="p-1 md:px-3 bg-white border border-gray-300 rounded hover:bg-gray-200 flex items-center md:gap-1" onClick={onClickAvg}>
                <span className='hidden md:flex items-center gap-1'>
                <Calculator size={16} />
                <span className="md:inline">AVG</span>
                </span>
                <span className='flex md:hidden items-center gap-1 text-xs'>
                 AVG
                </span>
              </button>
          </div>
          <div className="h-full border-r border-gray-300 mx-2"></div>
          <div className="flex gap-2">
              <button className="p-1 md:px-3 bg-white border border-gray-300 rounded hover:bg-gray-200 flex items-center md:gap-1" onClick={exportToJSON}>
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>
              <label htmlFor="import" className="p-1 md:px-3 bg-white border border-gray-300 rounded hover:bg-gray-200 cursor-pointer flex items-center md:gap-1">
                <Upload size={16} />
                <span className="hidden md:inline">Import</span>
              </label>
              <input id="import" type="file" onChange={importFromJSON} accept=".json" multiple={false} className="hidden" />
          </div>
      </div>
    )
}

export default Toolbar
