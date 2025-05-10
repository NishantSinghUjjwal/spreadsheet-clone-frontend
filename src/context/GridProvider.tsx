import React, { createContext, useEffect, useState } from 'react'
import { Cell, FormulaType } from '../types/types';
import { v4 as uuid } from 'uuid'
import { calculateFormula, getCellPosition, getSelectedCellsFromRange } from '../utils'
interface GridContextType {
    rows: number,
    cols: number,
    grid: Cell[][],
    selectedCells: string[],
    formulaCell: { type: 'SUM' | 'AVG' | null, cell: Cell | null } | null,
    selectedRange: { start: [number, number], end: [number, number] } | null,
    setSelectedCells: (cells: string[]) => void,
    setFormulaCell: (cell: { type: 'SUM' | 'AVG' | null, cell: Cell | null } | null) => void,
    setSelectedRange: (range: { start: [number, number], end: [number, number] } | null) => void,
    setGrid: (grid: Cell[][]) => void,
    setRows: (rows: number) => void,
    setCols: (cols: number) => void,
    addRow: () => void,
    addCol: () => void,
    changeCellBackground: (color: string) => void,
    changeFontWeight: () => void,
    onClickSum: () => void,
    onClickAvg: () => void,
    exportToJSON: () => void,
    importFromJSON: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleCopy: (e: ClipboardEvent) => void,
    handlePaste: (e: ClipboardEvent) => void,
    handleKeyDown: (e: KeyboardEvent) => void,
    calculateFormula: (type: FormulaType | null, values: number[]) => number,
    selectCell: (row: number, col: number, shiftPressed: boolean) => void,
    onChangeCellValue: (id: string, value: string) => void,
}
export const GridContext = createContext<GridContextType>({} as GridContextType)
const GridProvider = ({ children }: { children: React.ReactNode }) => {

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
    const [anchorCell, setAnchorCell] = useState<string | null>(null)
    const [lastCell, setLastCell] = useState<string | null>(null)

    const [formulaDependencies, setFormulaDependencies] = useState<Map<string, string[]>>(new Map())

    const [formulaCell, setFormulaCell] = useState<{ type: FormulaType | null, cell: Cell | null }>({ type: null, cell: null })

    const [selectedRange, setSelectedRange] = useState<{ start: [number, number], end: [number, number] } | null>(null)

    //initialize grid with default cell count i,e 10
    const [grid, setGrid] = useState<Cell[][]>(
        Array.from({ length: DEFAULT_CELL_COUNT }, (_, rIndex) =>
            Array.from({ length: DEFAULT_CELL_COUNT }, (_, cIndex) => {
                return {
                    ...INITIAL_CELL,
                    id: uuid(),
                    row: rIndex,
                    col: cIndex
                }
            })
        )
    );



    //this function is used to change the background color of the selected cells
    const changeCellBackground = (color: string) => {
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

    //this function is used to update the formula cell when the value of a cell changes
    const updateFormulaOnValueChange = (cellId: string, newCellValue: string) => {
        const usedFormulaCells: { cell: Cell, dependencies: string[] }[] = []

        //find the related formula cell 
        formulaDependencies.forEach((deps, targetCell: string) => {
            if (deps.includes(cellId)) {
                const [row, col] = getCellPosition(targetCell);
                if (row >= 0 && row < grid.length && col >= 0 && col < grid[row].length) {
                    const formulaCell = grid[row][col] as Cell;
                    if (formulaCell.formula) {
                        usedFormulaCells.push({ cell: formulaCell, dependencies: deps });
                    }
                }
            }
        });


        //update the formula cells accordin to new calculations
        usedFormulaCells.forEach(({ cell, dependencies }) => {
            const formulaType = cell.formula;
            if (!formulaType) return;

            const values = dependencies.map(cell => {

                //if the cell is the one that changed, then return the new value
                const [row, col] = getCellPosition(cell)
                if (`${row}-${col}` == cellId) return Number(newCellValue)
                return Number(grid[row][col].value)
            })

            //calculate the formula
            const total = calculateFormula(formulaType, values)

            //update the formula cell with the new value
            setGrid(prev => prev.map(row => row.map(c => {
                if (c.id == cell.id) return { ...c, value: total.toString() }
                return c
            })))
        })

    }


    //this function is used to change the value of a cell
    const onChangeCellValue = (id: string, value: string) => {
        setGrid(prev => prev.map((r, i) => r.map((c, j) => {
            const newCell = { ...c, value }

            //if the cell is a formula, then remove the formula,because we are manually changing it
            if (newCell.formula) {
                newCell.formula = null
            }
            if (`${i}-${j}` == id) return newCell
            else return c
        })))

        //if value changes re calculate the formula depending on this value
        updateFormulaOnValueChange(id, value)
    };

    //this function is used to add a new column to the grid
    const addCol = () => {

        //here we are pushing +1 cell in each row, so that as whole a new +1 column is added to the grid
        setGrid(prev => prev.map((row, i) => {
            return [...row, { ...INITIAL_CELL, id: uuid(), value: '', row: i, col: prev[i].length }]
        }))
        setCols(prev => prev + 1)
    };

    //this function is used to add a new row to the grid
    const addRow = () => {

        //to add a new row just push the number of columns in the grid one more time
        setGrid(prev => [...prev, Array.from({ length: cols }, (_, j) => ({ ...INITIAL_CELL, id: uuid(), value: '', row: prev.length, col: j }))])
        setRows(prev => prev + 1)
    };



    //this function is used to change the font weight of the selected cells
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

    //this function is used to copy the selected cells
    const handleCopy = (e: ClipboardEvent) => {
        if (!selectedCells.length) return;

        e.preventDefault(); // Prevent default copy behavior

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

        const [anchorRow, anchorCol] = getCellPosition(anchorId)

        if (anchorRow === undefined || anchorCol === undefined) return;

        for (const id of selectedCells) {
            const [row, col] = getCellPosition(id)
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


    //this function is used to paste the copied data into the grid
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

        const newGrid = [...grid.map(row => [...row])];

        if (copiedCells.length === 1) {
            // Paste one value into all selected cells
            const copied = copiedCells[0];

            for (const id of selectedCells) {
                const [row, col] = getCellPosition(id)

                if (row === undefined || col === undefined) continue;

                const targetCell = { ...newGrid[row][col] };
                targetCell.value = copied.value;
                targetCell.styles = { ...copied.styles };
                newGrid[row][col] = targetCell;
            }
        } else {
            // Multi-cell paste using relative position from anchor
            const [startRow, startCol] = getCellPosition(selectedCells[0])

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



    //this function is used to export the grid to a json file
    const exportToJSON = () => { //
        const json = JSON.stringify(grid, null, 2)

        const blob = new Blob([json], { type: 'application/json' })

        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url;
        a.download = 'spreadsheet.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    //this function is used to import a json file and set the grid to the imported data
    const importFromJSON: React.ChangeEventHandler<HTMLInputElement> | undefined = (e) => {
        if (!e.target.files) {
            alert('Something went wrong while uploading file')
            return
        }
        const jsonSheet = e.target.files[0]

        const fileReader = new FileReader()

        fileReader.onload = (e) => {
            const text = e.target?.result as string;
            const grid: Cell[][] | undefined = JSON.parse(text)

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

    //this function is used to select a cell and set the formula cell to sum
    const onClickSum = () => {
        if (!selectedCells.length) return;


        //set the formula cell to sum
        const [row, col] = getCellPosition(selectedCells[0])
        const actualFormulaCell = grid[row][col]
        setFormulaCell({ type: 'SUM', cell: { id: actualFormulaCell.id, row: row, col: col, styles: { fontWeight: 'normal', backgroundColor: 'lightgray' }, value: '=SUM()', formula: 'SUM' } })

        //now we will select first cell which contains data, to show users that cell can be selected
        grid.forEach((row, rIndex) => {
            row.forEach((cell, cIndex) => {
                if (cell.value != '' && !cell.formula) {
                    selectCell(rIndex, cIndex, false)
                    return;
                }
            })
        })
        setSelectedRange(null)

    }

    //this function is used to select a cell and set the formula cell to average
    const onClickAvg = () => {
        if (!selectedCells.length) return;

        //now we will select first cell which contains data, to show users that cell can be selected
        grid.forEach((row, rIndex) => {
            row.forEach((cell, cIndex) => {
                if (cell.value != '') {
                    selectCell(rIndex, cIndex, false)
                    return;
                }
            })
        })
        const [row, col] = getCellPosition(selectedCells[0])
        const actualCell = grid[row][col]
        setFormulaCell({ type: 'AVG', cell: { id: actualCell.id, row: row, col: col, styles: { fontWeight: 'normal', backgroundColor: 'lightgray' }, value: '=AVG()', formula: 'AVG' } })
    }




    //this function is used to select a cell or a range of cells
    const selectCell = (row: number, col: number, shiftPressed: boolean) => {
        if (shiftPressed && selectedCells.length>0) { //if shift is pressed and there are already selected cells, then we will select a range

            //get the anchor cell
            const start = getCellPosition(anchorCell || '');

            //current cell will be last cell of range
            const end: [number, number] = [row, col];
    
            const selectedRange = { start, end };
            
            //get the selected cell ids from range
            const selectedCellIds = getSelectedCellsFromRange(selectedRange);

            //set the selected cells and range
            if (selectedCellIds) setSelectedCells(selectedCellIds);
            setSelectedRange(selectedRange);
            
        } else { //if shift is not pressed, then we will select a single cell
            setSelectedRange(null)
            setSelectedCells([`${row}-${col}`])
            setAnchorCell(`${row}-${col}`)
        }
        setLastCell(`${row}-${col}`)
    }


    //this function is used to handle if any keyboard key is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            //if formula cell is not selected, then return
            if (!formulaCell.cell) return
            const selectedCells = getSelectedCellsFromRange(selectedRange)
            if (!selectedCells) return

            //get the values of the selected cells
            const values = selectedCells.map(cell => {
                const [row, col] = getCellPosition(cell)
                return Number(grid[row][col].value)
            })

            //calculate the formula
            const total = calculateFormula(formulaCell.type || null, values)

            //update the formula cell with results
            setGrid(prev => prev.map(row => row.map(cell => {
                if (cell.id == formulaCell.cell?.id) {
                    return { ...cell, value: total.toString(), formula: formulaCell.type }
                }
                return cell
            })))

            //link cells used for formula calculation with the formal cell
            setFormulaDependencies(prev => {
                const newDependencies = new Map(prev);
                newDependencies.set(`${formulaCell.cell?.row}-${formulaCell.cell?.col}` || '', selectedCells);
                return newDependencies;
            });

            //finally show formula cell as selected cell
            setSelectedCells([`${formulaCell.cell?.row}-${formulaCell.cell?.col}` || ''])

            //reset formula cell
            setFormulaCell({ type: null, cell: null })

        }

        //handle cell navigation on arrow keys
        if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {

            const anchor = getCellPosition(anchorCell || ''); // this is the first cell or range
            const last = getCellPosition(lastCell || ''); // this is the last cell of range
        
            if (!anchor || !last) return;
        
            let [newRow, newCol] = last;
        
            if (e.key === 'ArrowUp' && newRow > 0) newRow--;
            if (e.key === 'ArrowDown' && newRow < rows - 1) newRow++;
            if (e.key === 'ArrowLeft' && newCol > 0) newCol--;
            if (e.key === 'ArrowRight' && newCol < cols - 1) newCol++;
            selectCell(newRow, newCol, true)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Regular navigation without shift key
            const [row, col] = getCellPosition(selectedCells[0]);

            if (e.key === 'ArrowUp' && row > 0) {
                selectCell(row - 1, col, false);
            } else if (e.key === 'ArrowDown' && row < rows - 1) {
                selectCell(row + 1, col, false);
            } else if (e.key === 'ArrowLeft' && col > 0) {
                selectCell(row, col - 1, false);
            } else if (e.key === 'ArrowRight' && col < cols - 1) {
                selectCell(row, col + 1, false);
            }
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
    }, [grid, selectedCells, selectedRange]);





    useEffect(() => {

        if (grid.length == 0 || grid[0].length == 0) return;

        //select first cell by default
        setSelectedCells(['0-0'])
    }, [grid.length, grid[0].length])


    return (
        <GridContext.Provider value={{
            rows,
            cols,
            grid,
            selectedCells,
            selectCell,
            formulaCell,
            selectedRange,
            setSelectedCells,
            setFormulaCell: (cell: { type: 'SUM' | 'AVG' | null, cell: Cell | null } | null) => setFormulaCell(cell!),
            setSelectedRange,
            setGrid,
            setRows,
            setCols,
            addRow,
            addCol,
            changeCellBackground,
            changeFontWeight,
            onClickSum,
            onClickAvg,
            exportToJSON,
            importFromJSON: (e: React.ChangeEvent<HTMLInputElement>) => importFromJSON(e),
            handleCopy,
            handlePaste,
            handleKeyDown,
            calculateFormula,
            onChangeCellValue,
        }}>
            {children}
        </GridContext.Provider>
    )
}

export default GridProvider
