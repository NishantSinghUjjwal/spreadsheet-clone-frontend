import "./App.css";
import Toolbar from "./components/Toolbar";
import AddCellsLayout from "./components/AddCellsLayout";
import Footer from "./components/Footer";
import GridHeaderLayout from "./components/GridHeaderLayout";
import {useEffect} from 'react'
import Grid from "./components/Grid";

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
