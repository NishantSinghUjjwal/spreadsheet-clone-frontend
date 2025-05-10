import "./App.css";
import Toolbar from "./components/Toolbar";
import AddCellsLayout from "./components/Grid/SubComponents/AddCellsLayout";
import Footer from "./components/Footer";
import GridHeaderLayout from "./components/GridHeaderLayout";
import Grid from "./components/Grid/Grid";
import {useEffect} from 'react'
//10 x 10 default grid (DONE)
//can add more rows and columns (DONE)
//can perform SUM and AVG functions on selected cells (DONE)
//can format selected cells with bold text and background color (DONE)
//can copy paste cells (DONE)
//can save the  spreadsheet to JSON format (DONE)
//can load the spreadsheet from JSON format (DONE)

const App = () => {

    useEffect(()=>{
      document.title = 'Excel'
    },[])

  return (
    <div className="flex flex-col h-screen bg-white w-full">
      <div className="flex flex-col">
        <div className="bg-[#217346] text-white p-2 shadow-md flex items-center">
          <span className="font-bold text-xl mr-4">Excel</span>
        </div>
        <Toolbar
        />
      </div>

      <AddCellsLayout
      >
        <GridHeaderLayout
        >
          <Grid
          />
        </GridHeaderLayout>
      </AddCellsLayout>
      <Footer
      />
    </div>
  );
}

export default App;
