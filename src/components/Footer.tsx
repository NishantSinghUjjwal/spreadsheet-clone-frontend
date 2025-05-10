import React from 'react'
import useGridContext from '../hooks/useGridContext'
const Footer = () => {
  const {selectedCells} = useGridContext()
  return (
    <div className="bg-gray-100 p-1 text-xs text-gray-600 border-t border-gray-300 flex">
    <div className="px-2">
      {selectedCells.length > 0 ? `${selectedCells.length} cell${selectedCells.length > 1 ? 's' : ''} selected` : 'Ready'}
    </div>
  </div>
  )
}

export default Footer
