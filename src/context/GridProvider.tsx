import React, { createContext, useCallback, useEffect, useState } from 'react'
import { Cell, FormulaType } from '../types/types';
import { calculateFormula, getCellPosition, getSelectedCellsFromRange } from '../utils/reusableFunctions'
import { FORMULA_TYPES } from '../utils/constants';
interface GridContextType {
    rows: number,
    cols: number,
    grid: Cell[][],
    selectedCells: string[],
    selectedFormulaCell: { id: string, type: FormulaType | null } | null,
    selectedRange: { start: [number, number], end: [number, number] } | null,
    setSelectedCells: (cells: string[]) => void,
    setSelectedFormulaCell: (cell: { id: string, type: FormulaType | null } | null) => void,
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
    onChangeCellValue: (row: number, col: number, value: string) => void,
}

export const GridContext = createContext<GridContextType>({} as GridContextType)

//default grid rows and cols
const DEFAULT_CELL_COUNT = 10;

// default cell structure
const INITIAL_CELL: Cell = {
    value: "",
    styles: { fontWeight: "normal", backgroundColor: "transparent" },
    formula: null
};

const GridProvider = ({ children }: { children: React.ReactNode }) => {



    const [rows, setRows] = useState(DEFAULT_CELL_COUNT);

    const [cols, setCols] = useState(DEFAULT_CELL_COUNT);

    const [selectedCells, setSelectedCells] = useState<string[]>([])

    // (first cell of selected range)
    const [anchorCell, setAnchorCell] = useState<string | null>(null)

    // (last cell of selected range)
    const [lastCell, setLastCell] = useState<string | null>(null)

    // This is the formula dependencies (maintains the linkage of formula and cells used for the formula)
    const [formulaDependencies, setFormulaDependencies] = useState<Map<string, string[]>>(new Map())

    const [selectedFormulaCell, setSelectedFormulaCell] = useState<{ id: string, type: FormulaType | null } | null>(null)

    const [selectedRange, setSelectedRange] = useState<{ start: [number, number], end: [number, number] } | null>(null)

    const [grid, setGrid] = useState<Cell[][]>(
        Array.from({ length: DEFAULT_CELL_COUNT }, () =>
            Array.from({ length: DEFAULT_CELL_COUNT }, () => {
                return {
                    ...INITIAL_CELL,
                }
            })
        )
    );



    const changeCellBackground = useCallback((color: string) => {
        setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
            if (selectedCells.includes(`${rIndex}-${cIndex}`)) return {
                ...cell,
                styles: {
                    ...cell.styles,
                    backgroundColor: color || cell.styles.backgroundColor
                }
            }
            else return cell
        })))

    }, [selectedCells])


    //this function is used to update the formula cell when the value of a cell changes
    const updateFormulaOnValueChange = useCallback((row: number, col: number, newCellValue: string) => {
        const cellId = `${row}-${col}`
        const usedFormulaCells: { id: string, cell: Cell, dependencies: string[] }[] = []

        //find the related formula cells 
        formulaDependencies.forEach((deps, targetCell: string) => {
            if (deps.includes(cellId)) {
                const [row, col] = getCellPosition(targetCell);
                if (row >= 0 && row < grid.length && col >= 0 && col < grid[row].length) {
                    const selectedFormulaCell = grid[row][col] as Cell;
                    if (selectedFormulaCell.formula) {
                        usedFormulaCells.push({ id: targetCell, cell: selectedFormulaCell, dependencies: deps });
                    }
                }
            }
        });

        //update the formula cells accordin to new calculations
        usedFormulaCells.forEach(({ id: formulaCellId, cell, dependencies }) => {
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
            setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
                if (`${rIndex}-${cIndex}` == formulaCellId) return { ...cell, value: total.toString() }
                return cell
            })))
        })

    }, [formulaDependencies])


    const onChangeCellValue = useCallback((row: number, col: number, value: string) => {
        setGrid(prev => prev.map((r, i) => r.map((c, j) => {



            if (`${i}-${j}` == `${row}-${col}`) {
                const newCell = { ...c, value }
                //if the cell is a formula, then remove the formula,because we are manually changing it
                if (newCell.formula) {
                    newCell.formula = null
                }

                return newCell
            }
            else return c
        })))

        //if value changes re calculate the formula depending on this value
        updateFormulaOnValueChange(row, col, value)
    }, [updateFormulaOnValueChange])



    const addCol = useCallback(() => {

        //here we are pushing +1 cell in each row, so that as whole a new +1 column is added to the grid
        setGrid(prev => prev.map((row, i) => {
            return [...row, { ...INITIAL_CELL, value: '', }]
        }))
        setCols(prev => prev + 1)
    }, [])



    const addRow = useCallback(() => {
        //to add a new row just push the number of columns in the grid one more time
        setGrid(prev => [...prev, Array.from({ length: cols }, (_, j) => ({ ...INITIAL_CELL, value: '', }))]);
        setRows(prev => prev + 1)
    }, [cols])



    const changeFontWeight = useCallback(() => {
        setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
            if (selectedCells.includes(`${rIndex}-${cIndex}`)) return {
                ...cell,
                styles: {
                    ...cell.styles,
                    fontWeight: cell.styles.fontWeight == 'bold' ? '' : 'bold'
                }
            }
            else return cell
        })))
    }, [selectedCells])


    const exportToJSON = useCallback(() => { //
        const json = JSON.stringify(grid, null, 2)

        const blob = new Blob([json], { type: 'application/json' })

        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url;
        a.download = 'spreadsheet.json'
        a.click()
        URL.revokeObjectURL(url)
    }, [grid])


    const importFromJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
            const isValid = grid.every((row, rIndex) => {
                if (!Array.isArray(row)) {
                    return false
                }
                else return row.every((cell: Cell, cIndex) => {
                    if (typeof cell.value == 'string' || typeof cell.value == 'number') return true;
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

    }, [])


    const onClickSum = useCallback(() => {
        if (!selectedCells.length) return;


        //set the formula cell to sum
        const [row, col] = getCellPosition(selectedCells[0])
        setSelectedFormulaCell({ id: `${row}-${col}`, type: FORMULA_TYPES.SUM })

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

    }, [grid, selectedCells])


    const onClickAvg = useCallback(() => {
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
        setSelectedFormulaCell({ id: `${row}-${col}`, type: FORMULA_TYPES.AVG })
    }, [grid, selectedCells])




    const selectCell = useCallback((row: number, col: number, shiftPressed: boolean) => {
        //if shift is pressed and there are already selected cells, then we will select a range
        if (shiftPressed && selectedCells.length > 0) {

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
    }, [grid, selectedCells])


    const handleCopy = useCallback((e: ClipboardEvent) => {
        if (!selectedCells.length) return;

        e.preventDefault();

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
    }, [selectedCells])


    const handlePaste = useCallback((e: ClipboardEvent) => {
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
    }, [selectedCells])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {

        //when user has selected cells for calculating formula and presed enter
        if (e.key == 'Enter') {
            //if formula cell is not selected, then return
            if (!selectedFormulaCell) return
            const selectedCells = getSelectedCellsFromRange(selectedRange)
            if (!selectedCells) return

            //get the values of the selected cells
            const values = selectedCells.map(cell => {
                const [row, col] = getCellPosition(cell)
                return Number(grid[row][col].value)
            })

            //calculate the formula
            const total = calculateFormula(selectedFormulaCell.type || null, values)

            //update the formula cell with results
            setGrid(prev => prev.map((row, rIndex) => row.map((cell, cIndex) => {
                if (`${rIndex}-${cIndex}` == selectedFormulaCell.id) {
                    return { ...cell, value: total.toString(), formula: selectedFormulaCell.type }
                }
                return cell
            })))

            //link cells used for formula calculation with the formal cell
            setFormulaDependencies(prev => {
                const newDependencies = new Map(prev);
                newDependencies.set(selectedFormulaCell.id, selectedCells);
                return newDependencies;
            });

            //finally show formula cell as selected cell
            setSelectedCells([selectedFormulaCell.id])

            //reset formula cell
            setSelectedFormulaCell(null)

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
    }, [grid, selectedCells, selectedRange])



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
            selectedFormulaCell,
            selectedRange,
            setSelectedCells,
            setSelectedFormulaCell,
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
            importFromJSON,
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
