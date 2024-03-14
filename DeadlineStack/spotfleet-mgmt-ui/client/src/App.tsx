import React from 'react';
import './App.css';
import Structure from './Components/Structure';
import fleetData from './data/config';

function App() {

  return (
    <Structure data={fleetData} />
  );
}
export default App;
