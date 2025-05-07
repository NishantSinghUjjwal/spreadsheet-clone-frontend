import React, { KeyboardEventHandler, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { v4 as uuid } from 'uuid'
import { twMerge } from "tailwind-merge";
import { HexColorPicker } from "react-colorful";
//10 x 10 default grid (DONE)
//can add more rows and columns (DONE)
//can perform SUM and AVG functions on selected cells
//can format selected cells with bold text and background color (DONE)
//can copy paste cells
//can save the  spreadsheet to JSON format
//can load the spreadsheet from JSON format
interface Cell {
  id: null | string,
  value: string;
  styles: {
    fontWeight: string;
    backgroundColor: string;
  };
}
function App() {
  //default grid rows and cols
  const DEFAULT_CELL_COUNT = 10;

  // default cell structure
  const INITIAL_CELL: Cell = {
    id: null,
    value: "",
    styles: { fontWeight: "normal", backgroundColor: "transparent" },
  };


  const [rows, setRows] = useState(DEFAULT_CELL_COUNT);
  const [cols, setCols] = useState(DEFAULT_CELL_COUNT);


  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)

  const [showFillColorPicker,setShowFillColorPicker] = useState(false)

  //i used fill before, but it was causing issues, thats why has to use .from()
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: DEFAULT_CELL_COUNT }, () =>
      Array.from({ length: DEFAULT_CELL_COUNT }, () => ({
        ...INITIAL_CELL,
        id: uuid(),
      }))
    )
  );
  

  console.log(grid)
  //i need to implement debouncing here later :TODO
  const onChangeCell = (row: number, col: number, value: string) => {
    console.log('onchange called', row, col)

    setGrid(prev => prev.map((r, i) => r.map((c, j) => {
      if (i == row && j == col) return { ...c, value }
      else return c
    })))
  };

  const addCol = () => {

    //here we are pushing +1 cell in each row, so that as whole a new +1 column is added to the grid
    setGrid(prev => prev.map(row => {
      return [...row, { ...INITIAL_CELL, id: uuid() }]
    }))
    setCols(prev => prev + 1)
  };

  const addRow = () => {

    //to add a new row just push the number of columns in the grid one more time
    setGrid(prev => [...prev, Array(cols).fill({ ...INITIAL_CELL, id: uuid() })])
    setRows(prev => prev + 1)

  };


  const changeFontWeight=()=>{
    setGrid(prev => prev.map(row => row.map(cell => {
      if (cell.id == selectedCell?.id) return {
        ...cell,
        styles: {
          ...cell.styles,
          fontWeight: cell.styles.fontWeight == 'bold' ? '' : 'bold'
        }
      }
      else return cell
    })))
  }
  
  const changeCellBackground=(color:string)=>{
    setGrid(prev => prev.map(row => row.map(cell => {
      if (cell.id == selectedCell?.id) return {
        ...cell,
        styles: {
          ...cell.styles,
          backgroundColor: color ||cell.styles.backgroundColor
        }
      }
      else return cell
    })))
  }



  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key);
  };

  return (
    <div className="flex flex-col items-start justify-start h-screen transition-all">

      {/* TOPBAR */}
      <div className="flex gap-2 bg-slate-100 w-full">
        <button className=" hover:bg-slate-400 w-6 " onClick={changeFontWeight}>B</button>
        <div className="relative w-fit">
        <button className="hover:bg-slate-400 w-6 relative" onClick={()=>setShowFillColorPicker(prev=>!prev)}>A </button>
        {showFillColorPicker &&<HexColorPicker color={'black'} onChange={changeCellBackground} />}
        </div>
      </div>
      {/* GRID */}
      <div className="border-2 border-slate-950 relative">
        <button
          className="absolute text-xs right-0 translate-x-full top-1/2 -translate-y-1/2 bg-slate-400 h-4 w-4"
          onClick={addCol}>
          +
        </button>
        <button
          className="absolute text-xs bottom-0 translate-y-full left-1/2 -translate-x-1/2 bg-slate-400 h-4 w-4"
          onClick={addRow}>
          +
        </button>
        <div
          className="border-2 border-gray-300 grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols},1fr)`,
            gridTemplateRows: `repeat(${rows},1fr)`,
          }}>
          {grid.map((row, rIndex) =>
            row.map((cell, cIndex) => (
              <div onClick={()=>setSelectedCell(cell)} key={cIndex} className={twMerge("border border-gray-300 w-10 h-6 flex items-center",selectedCell?.id==cell.id && "border-2 border-green-700" )} >
                <input
                  type="text"
                  className={twMerge("w-full h-full px-2 outline-none border-none text-center text-xs")}
                  style={{
                    fontWeight:cell.styles.fontWeight||'',
                    backgroundColor:cell.styles.backgroundColor||'transparent'
                  }}
                  value={cell.value}
                  onChange={(e) => onChangeCell(rIndex, cIndex, e.target.value)}

                  onKeyDown={onKeyDown}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
