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
import { Cell } from "./types/types";
//10 x 10 default grid (DONE)
//can add more rows and columns (DONE)
//can perform SUM and AVG functions on selected cells (DONE)
//can format selected cells with bold text and background color (DONE)
//can copy paste cells (DONE) Multiple is remaining
//can save the  spreadsheet to JSON format (DONE)
//can load the spreadsheet from JSON format (DONE)

const App = () => {

  
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
