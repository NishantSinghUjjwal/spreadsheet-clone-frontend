# React Spreadsheet Application

A feature-rich spreadsheet application built with React and TypeScript that allows you to create, edit, and manage spreadsheets with various formatting options and formula calculations.

## Features

- 10x10 default grid layout
- Add more rows and columns as needed
- Apply formatting (bold text and background colors) to cells
- Use SUM and AVG functions on selected cells
- Copy and paste cell content
- Export spreadsheet to JSON format
- Import spreadsheet from JSON format

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd react-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

To start the development server:

```bash
npm start
# or
yarn start
```

This will launch the application in development mode at [http://localhost:3000](http://localhost:3000).

## Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `build` directory.

## Usage Guide

### Basic Navigation
- Click on a cell to select it
- Use mouse to navigate between cells
- Use Shift + mouse click to select multiple cells

### Formatting Cells
- Select a cell or multiple cells
- Use the toolbar to:
  - Toggle bold text formatting
  - Change background color

### Using Formulas
1. Select a cell where you want to display the result
2. Click on the SUM or AVG button in the toolbar
3. Select the range of cells you want to include in the calculation
4. The result will be displayed in the initially selected cell

### Adding Rows and Columns
- Click the "Add Row" button to add a new row at the bottom
- Click the "Add Column" button to add a new column on the right

### Export/Import
- Click "Export" to save your spreadsheet as a JSON file
- Click "Import" and select a previously exported JSON file to load a spreadsheet

## Technologies Used

- React 19
- TypeScript
- TailwindCSS
- UUID
- React Colorful (for color picker)

## License

[MIT](LICENSE)
