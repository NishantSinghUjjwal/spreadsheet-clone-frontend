import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

const Toolbar = ({
    changeFontWeight,
    changeCellBackground,
    onClickSum,
    onClickAvg,
    exportToJSON,
    importFromJSON
}: {
    changeFontWeight: () => void
    changeCellBackground: (color: string) => void
    onClickSum: () => void
    onClickAvg: () => void
    exportToJSON: () => void
    importFromJSON: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    const [showFillColorPicker, setShowFillColorPicker] = useState(false)
    return (<div className="flex gap-2 bg-gray-100 p-2 border-b border-gray-300 items-center">
        <button className="p-1 px-2 bg-white border border-gray-300 rounded hover:bg-gray-200 font-bold" onClick={changeFontWeight}>B</button>
        <div className="relative">
            <button className="p-1 px-2 bg-white border border-gray-300 rounded hover:bg-gray-200 flex items-center" onClick={() => setShowFillColorPicker(prev => !prev)}>
                <span className="mr-1">A</span>
                <div className="w-3 h-3 border border-gray-400 bg-black"></div>
            </button>
            {showFillColorPicker && (
                <div className="absolute z-10 mt-1 shadow-xl">
                    <HexColorPicker color={'black'} onChange={changeCellBackground} />
                </div>
            )}
        </div>
        <div className="h-full border-r border-gray-300 mx-2"></div>
        <button className="p-1 px-3 bg-white border border-gray-300 rounded hover:bg-gray-200" onClick={onClickSum}>SUM</button>
        <button className="p-1 px-3 bg-white border border-gray-300 rounded hover:bg-gray-200" onClick={onClickAvg}>AVG</button>
        <div className="h-full border-r border-gray-300 mx-2"></div>
        <button className="p-1 px-3 bg-white border border-gray-300 rounded hover:bg-gray-200" onClick={exportToJSON}>Export</button>
        <label htmlFor="import" className="p-1 px-3 bg-white border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">Import</label>
        <input id="import" type="file" onChange={importFromJSON} accept=".json" multiple={false} className="hidden" />
    </div>
    )
}

export default Toolbar
