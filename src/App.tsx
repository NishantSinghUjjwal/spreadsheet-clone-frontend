import React, { KeyboardEventHandler, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { v4 as uuid } from 'uuid'
import { twMerge } from "tailwind-merge";
import { HexColorPicker } from "react-colorful";
import Toolbar from "./components/Toolbar";
import AddCellsLayout from "./components/Grid/SubComponents/AddCellsLayout";
import Footer from "./components/Footer";
import GridHeaderLayout from "./components/GridHeaderLayout";
import Grid from "./components/Grid/Grid";
//10 x 10 default grid (DONE)
//can add more rows and columns (DONE)
//can perform SUM and AVG functions on selected cells (DONE)
//can format selected cells with bold text and background color (DONE)
//can copy paste cells (DONE) Multiple is remaining
//can save the  spreadsheet to JSON format
//can load the spreadsheet from JSON format
export interface Cell {
  id: null | string,
  value: string;
  row?: number;
  col?: number;
  styles: {
    fontWeight: string;
    backgroundColor: string;
  };
  formula?: 'SUM' | 'AVG' | null
}

function App() {

  //default grid rows and cols
  const DEFAULT_CELL_COUNT = 10;

  // default cell structure
  const INITIAL_CELL: Cell = {
    id: null,
    value: "",
    row: undefined,
    col: undefined,
    styles: { fontWeight: "normal", backgroundColor: "transparent" },
    formula: null
  };



  const [rows, setRows] = useState(DEFAULT_CELL_COUNT);
  const [cols, setCols] = useState(DEFAULT_CELL_COUNT);


  const [selectedCells, setSelectedCells] = useState<string[]>([])

  const [showFillColorPicker, setShowFillColorPicker] = useState(false)

  const [formulaDependencies, setFormulaDependencies] = useState<Map<string, string[]>>(new Map())

  const [formulaCell, setFormulaCell] = useState<{ type: 'SUM' | 'AVG' | null, cell: Cell | null }>({ type: null, cell: null })

  const [selectedRange, setSelectedRange] = useState<{ start: [number, number], end: [number, number] } | null>(null)

  //i used fill before, but it was causing issues, thats why has to use .from()
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: DEFAULT_CELL_COUNT }, () =>
      Array.from({ length: DEFAULT_CELL_COUNT }, () => ({
        ...INITIAL_CELL,
        id: uuid(),
      }))
    )
  );


  const changeCellBackground = (color: string) => {
    console.log('color', color)
    setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
      if (selectedCells.includes(`${rIndex}-${cIndex}` || '')) return {
        ...cell,
        styles: {
          ...cell.styles,
          backgroundColor: color || cell.styles.backgroundColor
        }
      }
      else return cell
    })))
  }

  function updateFormula(cellId: string, newCellValue: string) {
    console.log('cellId', cellId)
    let usedFormulaCell: Cell | null = null;
    let dependencies: string[] = [];

    formulaDependencies.forEach((deps, targetCell: string) => {
      if (deps.includes(cellId)) {
        const [row, col] = targetCell.split('-').map(Number);
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[row].length) {
          const formulaCell = grid[row][col] as Cell;
          if (formulaCell.formula) {
            usedFormulaCell = formulaCell;
            dependencies = deps;
          }
        }
      }
    });

    console.log('usedFormulaCell', usedFormulaCell)
    //@ts-ignore
    if (!usedFormulaCell || !usedFormulaCell.formula) return;
    // Add type assertion to help TypeScript understand the type
    const cell = usedFormulaCell as Cell;
    const formulaType = cell.formula;
    if (!formulaType) return
    const values = dependencies.map(cell => {
      const [row, col] = cell.split('-').map(Number)
      if (`${row}-${col}` == cellId) return Number(newCellValue)
      return Number(grid[row][col].value)
    })

    const total = calculateFormula(formulaType, values)

    if (isNaN(Number(total)) || total == undefined) return
    setGrid(prev => prev.map(row => row.map(cell => {
      if (cell.id == usedFormulaCell?.id) return { ...cell, value: total }
      return cell
    })))
  }


  //i need to implement debouncing here later :TODO
  const onChangeCell = (id: string, value: string) => {
    setGrid(prev => prev.map((r, i) => r.map((c, j) => {
      if (`${i}-${j}` == id) return { ...c, value }
      else return c
    })))
    updateFormula(id, value)
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
    setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
      if (selectedCells.includes(`${rIndex}-${cIndex}` || '')) return {
        ...cell,
        styles: {
          ...cell.styles,
          fontWeight: cell.styles.fontWeight == 'bold' ? '' : 'bold'
        }
      }
      else return cell
    })))
  }


  const createIdPositionMap = (grid: Cell[][]): Map<string, [number, number]> => {
    const map = new Map();
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        if (cell.id) map.set(cell.id, [row, col]);
      }
    }
    return map;
  }
  const handleCopy = (e: ClipboardEvent) => {
    if (!selectedCells.length) return;

    e.preventDefault(); // Prevent default copy behavior

    const idMap = createIdPositionMap(grid); // Maps cell.id => [row, col]

    const copiedData: {
      rowOffset: number;
      colOffset: number;
      value: string;
      styles: {
        fontWeight: string;
        backgroundColor: string;
      };
    }[] = [];

    const anchorId = selectedCells[0];
    const [anchorRow, anchorCol] = idMap.get(anchorId) ?? [];

    if (anchorRow === undefined || anchorCol === undefined) return;

    for (const id of selectedCells) {
      const [row, col] = idMap.get(id) ?? [];
      if (row === undefined || col === undefined) continue;

      const cell = grid[row][col];
      copiedData.push({
        rowOffset: row - anchorRow,
        colOffset: col - anchorCol,
        value: cell.value,
        styles: {
          fontWeight: cell.styles.fontWeight,
          backgroundColor: cell.styles.backgroundColor,
        },
      });
    }

    e.clipboardData?.setData('application/json', JSON.stringify(copiedData));
  };


  const handlePaste = (e: ClipboardEvent) => {
    if (!selectedCells.length) return;

    const data = e.clipboardData?.getData('application/json');
    if (!data) return;

    e.preventDefault();

    let copiedCells: {
      rowOffset: number;
      colOffset: number;
      value: string;
      styles: { fontWeight: string; backgroundColor: string };
    }[];

    try {
      copiedCells = JSON.parse(data);
    } catch (err) {
      console.error('Invalid clipboard data format');
      return;
    }

    if (!copiedCells?.length) return;

    const idMap = createIdPositionMap(grid);
    const newGrid = [...grid.map(row => [...row])];

    if (copiedCells.length === 1) {
      // Paste one value into all selected cells
      const copied = copiedCells[0];

      for (const id of selectedCells) {
        const [row, col] = idMap.get(id) ?? [];

        if (row === undefined || col === undefined) continue;

        const targetCell = { ...newGrid[row][col] };
        targetCell.value = copied.value;
        targetCell.styles = { ...copied.styles };
        newGrid[row][col] = targetCell;
      }
    } else {
      // Multi-cell paste using relative position from anchor
      const [startRow, startCol] = idMap.get(selectedCells[0]) ?? [0, 0];

      for (const cellData of copiedCells) {
        const targetRow = startRow + cellData.rowOffset;
        const targetCol = startCol + cellData.colOffset;

        if (
          targetRow >= newGrid.length ||
          targetCol >= newGrid[0].length ||
          targetRow < 0 ||
          targetCol < 0
        ) {
          continue;
        }

        const targetCell = { ...newGrid[targetRow][targetCol] };
        targetCell.value = cellData.value;
        targetCell.styles = { ...cellData.styles };
        newGrid[targetRow][targetCol] = targetCell;
      }
    }

    setGrid(newGrid);
  };




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

      //check if each cell is valid
      const isValid = grid.every(row => {
        if (!Array.isArray(row)) {
          return false
        }
        else return row.every((cell: Cell) => {
          if (cell.id && typeof cell.value == 'string' || typeof cell.value == 'number') return true;
          else {
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
    if (!selectedCells.length) return;

    //now we will select first cell which contains data, to show users that cell can be selected
    grid.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        if (cell.value != '') {
          setSelectedCells([`${rIndex}-${cIndex}` || ''])
          return;
        }
      })
    })
    const [row, col] = selectedCells[0].split('-').map(Number)
    const actualCell = grid[row][col]
    setFormulaCell({ type: 'SUM', cell: { id: actualCell.id, row: row, col: col, styles: { fontWeight: 'normal', backgroundColor: 'lightgray' }, value: '=SUM()', formula: 'SUM' } })
  }

  const onClickAvg = () => {
    if (!selectedCells.length) return;

    //now we will select first cell which contains data, to show users that cell can be selected
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.value != '') {
          setSelectedCells([`${cell.row}-${cell.col}` || ''])
          return;
        }
      })
    })
    setFormulaCell({ type: 'AVG', cell: { id: selectedCells[0], styles: { fontWeight: 'normal', backgroundColor: 'lightgray' }, value: '=AVG()', formula: 'AVG' } })
  }

  const calculateFormula = (type: string | null, values: number[]) => {
    if (type == 'SUM') {
      return calculateSum(values)
    }
    else if (type == 'AVG') {
      return calculateAvg(values)
    }
  }

  const calculateSum = (values: number[]) => {
    let total = values.reduce((acc, cell) => {
      return acc + Number(cell)
    }, 0)

    return total.toString()
  }

  const calculateAvg = (values: number[]) => {
    let total = values.reduce((acc, cell) => {
      return acc + Number(cell)
    }, 0)
    const avg = total / values.length
    return avg.toString()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      if (!formulaCell.cell) return
      const selectedCells = getSelectedCellsFromRange()
      if (!selectedCells) return

      const values = selectedCells.map(cell => {
        const [row, col] = cell.split('-').map(Number)
        return Number(grid[row][col].value)
      })
      const total = calculateFormula(formulaCell.type || null, values)
      if (isNaN(Number(total)) || total == undefined) return;

      setGrid(prev => prev.map(row => row.map(cell => {
        if (cell.id == formulaCell.cell?.id) {
          return { ...cell, value: total, formula: formulaCell.type }
        }
        return cell
      })))

      setFormulaDependencies(prev => {
        const newDependencies = new Map(prev);
        newDependencies.set(`${formulaCell.cell?.row}-${formulaCell.cell?.col}` || '', selectedCells);
        return newDependencies;
      });

      setSelectedCells([`${formulaCell.cell?.row}-${formulaCell.cell?.col}` || ''])
      setFormulaCell({ type: null, cell: null })

    }
  }

  const selectCell = (cell: Cell, row: number, col: number, shiftPressed: boolean, ctrlPressed: boolean) => {

    // if (selectedCells.length > 1 && ctrlPressed && selectedCells.includes(`${row}-${col}` || '')) {
    //   //if cell is secondary cell and cell is already selected, then remove it from selected cells
    //   setSelectedCells(prev => prev.filter(id => id != `${row}-${col}` || ''))
    // }
    // else if(ctrlPressed){
    //   setSelectedCells(prev => [...prev, `${row}-${col}` || ''])
    // }
    if (shiftPressed) {
      //if shift is preseed we need to save range of ids inside array

      setSelectedRange(prev => {
        if (prev == null) {
          let start = null
          grid.forEach((r, rIndex) => {
            r.forEach((c, cIndex) => {
              if (`${rIndex}-${cIndex}` == selectedCells[0]) {
                start = [rIndex, cIndex]
              }
            })
          })
          return { start: start || [row, col], end: [row, col] }
        }
        else {
          return { start: prev.start, end: [row, col] }
        }
      })

    }
    else {
      setSelectedRange(null)
      setSelectedCells([`${row}-${col}` || ''])
    }
  }
  useEffect(() => {
    const handlePasteWrapper = (e: ClipboardEvent) => handlePaste(e);
    const handleCopyWrapper = (e: ClipboardEvent) => handleCopy(e);

    document.addEventListener('paste', handlePasteWrapper);
    document.addEventListener('copy', handleCopyWrapper);
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('paste', handlePasteWrapper);
      document.removeEventListener('copy', handleCopyWrapper);
      document.removeEventListener('keydown', handleKeyDown)
    };
  }, [grid, selectedCells]); // Include dependencies that `handlePaste` and `handleCopy` rely on


  const getSelectedCellsFromRange = () => {

    if (!selectedRange?.start && !selectedRange?.end) return;


    const [startRow, startCol] = selectedRange.start || selectedRange.end;
    const [endRow, endCol] = selectedRange.end || selectedRange.start;

    const top = Math.min(startRow, endRow);
    const bottom = Math.max(startRow, endRow);
    const left = Math.min(startCol, endCol);
    const right = Math.max(startCol, endCol);

    const selectedIDs: string[] = [];

    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        selectedIDs.push(`${r}-${c}`);
      }
    }

    return selectedIDs
  }
  useEffect(() => {
    if (!selectedRange?.start || !selectedRange?.end) return
    const selectedCells = getSelectedCellsFromRange()
    if (!selectedCells) return
    setSelectedCells([...selectedCells])

  }, [selectedRange?.start, selectedRange?.end])
  return (
    <div className="flex flex-col h-screen bg-white w-full">
      <div className="flex flex-col">
      {/* Navbar */}
      <div className="bg-[#217346] text-white p-2 shadow-md flex items-center">
        <span className="font-bold text-xl mr-4">Excel</span>
      </div>

      <Toolbar
        changeFontWeight={changeFontWeight}
        changeCellBackground={changeCellBackground}
        onClickSum={onClickSum}
        onClickAvg={onClickAvg}
        exportToJSON={exportToJSON}
        importFromJSON={importFromJSON}
        />
        </div>

      <AddCellsLayout addRow={addRow} addCol={addCol}>
        <GridHeaderLayout rows={rows} cols={cols} selectedCells={selectedCells} >
          <Grid cols={cols} rows={rows} grid={grid} formulaCell={formulaCell} selectedCells={selectedCells} selectCell={selectCell} onChangeCell={onChangeCell} addRow={addRow} addCol={addCol}
          />
        </GridHeaderLayout>
      </AddCellsLayout>
      <Footer selectedCells={selectedCells} />
    </div>
  );
}

export default App;
