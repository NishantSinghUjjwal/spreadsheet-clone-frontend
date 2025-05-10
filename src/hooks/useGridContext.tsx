import { useContext } from 'react'
import { GridContext } from '../context/GridProvider'

const useGridContext = () => {
    const gridContext = useContext(GridContext)
    if (!gridContext) {
        throw new Error('useGridContext must be used within a GridProvider')
    }
  return gridContext
}

export default useGridContext
