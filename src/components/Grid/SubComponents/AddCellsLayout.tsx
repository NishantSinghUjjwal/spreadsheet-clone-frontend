import React from 'react'
import useGridContext from '../../../hooks/useGridContext'
const AddCellsLayout = ({ children,  }: { children: React.ReactNode, }) => {
    const {addRow, addCol} = useGridContext()
    return (
        <div className="flex h-[calc(100%_-_7.50rem)] relative">
            <div className="flex flex-col w-[calc(100%_-_1.5rem)] h-full">
                {children}
                <button
                 className=" w-full h-6 text-xs bg-gray-200 hover:bg-gray-300 border-l border-gray-400 mt-auto"
                    onClick={addRow}>
                    +
                </button>
            </div>
            <button
               className=" w-6 min-w-6 h-full text-xs bg-gray-200 hover:bg-gray-300 border-t border-gray-400"
                onClick={addCol}>
                +
            </button>
        </div>
    )
}

export default AddCellsLayout
