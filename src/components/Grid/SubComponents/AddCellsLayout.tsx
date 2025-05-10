import React from 'react'

const AddCellsLayout = ({ children, addRow, addCol }: { children: React.ReactNode, addRow: () => void, addCol: () => void }) => {
    return (
        <div className="flex w-full h-full">
            <div className="flex flex-col w-full">
                {children}
                <button
                    className="text-xs bg-gray-200 h-6 w-full flex items-center justify-center hover:bg-gray-300 border border-gray-400"
                    onClick={addRow}>
                    +
                </button>
            </div>
            <button
                className="text-xs bg-gray-200 h-full w-6 flex items-center justify-center hover:bg-gray-300 border border-gray-400"
                onClick={addCol}>
                +
            </button>
        </div>
    )
}

export default AddCellsLayout
