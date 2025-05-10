import React, { KeyboardEventHandler, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { v4 as uuid } from 'uuid'
import { twMerge } from "tailwind-merge";
import { HexColorPicker } from "react-colorful";
//10 x 10 default grid (DONE)
//can add more rows and columns (DONE)
//can perform SUM and AVG functions on selected cells (DONE)
//can format selected cells with bold text and background color (DONE)
//can copy paste cells (DONE) Multiple is remaining
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


  const [selectedCells, setSelectedCells] = useState<string[]>([])

  const [showFillColorPicker, setShowFillColorPicker] = useState(false)

  const [formulaCell, setFormulaCell] = useState<{ type: 'SUM' | 'AVG' | null, cell: Cell | null }>({ type: null, cell: null })

  const [selectedRange, setSelectedRange] = useState<{ start: [number,number], end: [number,number] } | null>(null)

  //i used fill before, but it was causing issues, thats why has to use .from()
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: DEFAULT_CELL_COUNT }, () =>
      Array.from({ length: DEFAULT_CELL_COUNT }, () => ({
        ...INITIAL_CELL,
        id: uuid(),
      }))
    )
  );


  //i need to implement debouncing here later :TODO
  const onChangeCell = (row: number, col: number, value: string) => {
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


  const changeFontWeight = () => {
    setGrid(prev => prev.map(row => row.map(cell => {
      if (selectedCells.includes(cell.id || '')) return {
        ...cell,
        styles: {
          ...cell.styles,
          fontWeight: cell.styles.fontWeight == 'bold' ? '' : 'bold'
        }
      }
      else return cell
    })))
  }

  const changeCellBackground = (color: string) => {
    setGrid(prev => prev.map(row => row.map(cell => {
      if (selectedCells.includes(cell.id || '')) return {
        ...cell,
        styles: {
          ...cell.styles,
          backgroundColor: color || cell.styles.backgroundColor
        }
      }
      else return cell
    })))
  }

  const handleCopy = (e: ClipboardEvent) => {

    if (!selectedCells.length) return;

    const selection = window.getSelection()

    console.log('selectedCells', selection)

    const node = selection?.focusNode
    //@ts-ignore
    let id: string = node?.id

    if (!id || !id.startsWith('cell_')) return; //if copied element is not the cell or related data, then skip

    id = id.replace("cell_", '') //get actual uuid

    e.preventDefault() // else prevent default vopy pasting behaviour

    let actualCell: Cell | null = null

    for (const row of grid) {
      for (const cell of row) {
        if (cell.id == id) {
          actualCell = cell;
          break;
        }
      }
    }

    if (!actualCell) return

    if (selection?.type == 'Caret' || selection?.type == 'Range') {
      e.clipboardData?.setData('application/json', JSON.stringify(actualCell))
      //whole cell is copied
    }

  }

  const handlePaste = (e: ClipboardEvent) => {
    if (!selectedCells.length) return;

    const data = e.clipboardData?.getData('application/json')

    if (!data) return;

    e.preventDefault()

    const copiedCell: Cell | undefined = JSON.parse(data)

    if (!copiedCell || copiedCell.id == selectedCells[0]) return;

    // setGrid(prev=>prev.map(row=>row.map(cell=>{
    //   if(cell.id == selectedCell.id) return {...copiedCell,id:cell.id}
    //   else return cell
    // })))
  }


  const exportToJSON = () => { //
    const json = JSON.stringify(grid, null, 2)

    const blob = new Blob([json], { type: 'application/json' })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url;
    a.download = 'spreadsheet.json'
    a.click()
  }


  const importFromJSON: React.ChangeEventHandler<HTMLInputElement> | undefined = (e) => {
    if (!e.target.files) {
      alert('SOmething went wrong while uploading file')
      return
    }
    const jsonSheet = e.target.files[0]

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const text = e.target?.result as string;
      const grid = JSON.parse(text)

      if (!Array.isArray(grid)) {
        alert('Invalid format');
        return
      }

      console.log(grid)
      //check if each cell is valid
      const isValid = grid.every(row => {
        if (!Array.isArray(row)) {
          console.log('row not an array')
          return false
        }
        else return row.every((cell: Cell) => {
          if (cell.id && typeof cell.value == 'string' || typeof cell.value == 'number') return true;
          else {
            console.log('cell is not valid', cell.id, typeof cell)
            return false
          }
        })
      })

      if (!isValid) {
        alert('Invalid file');
        return
      }

      setCols(grid[0].length)
      setRows(grid.length)
      setGrid(grid)
    }

    fileReader.readAsText(jsonSheet)

  }

  const onClickSum = () => {
    console.log('SUM', selectedCells)
    if (!selectedCells.length) return;

    //now we will select first cell which contains data, to show users that cell can be selected
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.value != '') {
          setSelectedCells([cell.id || ''])
          return;
        }
      })
    })
    setFormulaCell({ type: 'SUM', cell: { id: selectedCells[0], styles: { fontWeight: 'normal', backgroundColor: 'lightgray' }, value: '=SUM()' } })
  }

  const calculateFormula = (type: string | null) => {
    if (type == 'SUM') {
      return calculateSum()
    }
    else if (type == 'AVG') {
      return calculateAvg()
    }
  }

  const calculateSum = () => {
    let total = grid.flat().reduce((acc, cell) => {
      if (selectedCells.includes(cell.id || '')) {
        return acc + Number(cell.value)
      }
      return acc
    }, 0)

    return total.toString()
  }

  const calculateAvg = () => {
    const flattenedGrid = grid.flat()
    let total = flattenedGrid.reduce((acc, cell) => {
      return acc + Number(cell.value)
    }, 0)
    const avg = total / flattenedGrid.length
    return avg.toString()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      const total = calculateFormula(formulaCell.type || null)
      if (isNaN(Number(total)) || total == undefined) return;

      setGrid(prev => prev.map(row => row.map(cell => {
        if (cell.id == formulaCell.cell?.id) {
          return { ...cell, value: total }
        }
        return cell
      })))

      setSelectedCells([formulaCell.cell?.id || ''])
      setFormulaCell({ type: null, cell: null })

    }
  }

  const selectCell = (cell: Cell,row:number,col:number, shiftPressed: boolean,ctrlPressed:boolean) => {
    console.log('cell', cell, 'shift', shiftPressed, 'ctrl', ctrlPressed)

    if (selectedCells.length > 1 && ctrlPressed && selectedCells.includes(cell.id || '')) {
      //if cell is secondary cell and cell is already selected, then remove it from selected cells
      console.log('removing cell', cell.id)
      setSelectedCells(prev => prev.filter(id => id != cell.id || ''))
    }
    else if(ctrlPressed){
      setSelectedCells(prev => [...prev, cell.id || ''])
    }
    else if (shiftPressed) {
      //if shift is preseed we need to save range of ids inside array
      
     setSelectedRange(prev=>{
      if(prev == null){
        let start = null
        grid.forEach((r,rIndex)=>{
          r.forEach((c,cIndex)=>{
            if(c.id == selectedCells[0]){
              start = [rIndex,cIndex]
            }
          })
        })
        return {start:start||[row,col],end:[row,col]} 
      }
      else{
        return {start:prev.start,end:[row,col]}
      }
     })

    }
    else {
      setSelectedRange(null)
      setSelectedCells([cell.id || ''])
    }
  }

  useEffect(() => {
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCells.length, grid])


  useEffect(()=>{
    
    if (!selectedRange?.start || !selectedRange?.end) return;

    const [startRow, startCol] = selectedRange.start;
    const [endRow, endCol] = selectedRange.end;
  
    const top = Math.min(startRow, endRow);
    const bottom = Math.max(startRow, endRow);
    const left = Math.min(startCol, endCol);
    const right = Math.max(startCol, endCol);
  
    const selectedIDs: string[] = [];
  
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        selectedIDs.push(grid[r][c].id || '');
      }
    }

    setSelectedCells([...selectedIDs])
    
  },[selectedRange?.start,selectedRange?.end])
    

  return (
    <div className="flex flex-col items-start justify-start h-screen transition-all">

      {/* TOPBAR */}
      <div className="flex gap-2 bg-slate-100 w-full">
        <button className=" hover:bg-slate-400 w-6 " onClick={changeFontWeight}>B</button>
        <div className="relative w-fit">
          <button className="hover:bg-slate-400 w-6 relative" onClick={() => setShowFillColorPicker(prev => !prev)}>A </button>
          {showFillColorPicker && <HexColorPicker color={'black'} onChange={changeCellBackground} />}
        </div>
        <button className="hover:bg-slate-400 relative border" onClick={exportToJSON}>Export as JSON</button>
        <label htmlFor="import" className="hover:bg-slate-400 relative border">Import</label>
        <input id="import" type="file" onChange={importFromJSON} accept=".json" multiple={false} className="hidden" />

        <button className="border" onClick={onClickSum}>SUM</button>
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
            row.map((cell, cIndex) => {
              const data = formulaCell.cell && formulaCell.cell.id == cell.id ? { ...formulaCell.cell } : { ...cell }
              return (
                <div
                  onClick={(e) => selectCell(cell, rIndex, cIndex, e.shiftKey, e.ctrlKey)}
                  id={`cell_${cell.id}`} key={cIndex} className={twMerge("border border-gray-300 w-10 h-6 flex items-center", selectedCells.includes(cell.id || '') && "border-2 border-green-700", formulaCell.cell && selectedCells.includes(cell.id || '') && "border-2 border-dashed")} >
                  <input
                    type="text"
                    className={twMerge("w-full h-full px-2 outline-none border-none text-center text-xs")}
                    style={data.styles}
                    value={data.value}
                    onChange={(e) => onChangeCell(rIndex, cIndex, e.target.value)}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
