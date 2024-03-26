import React from 'react';
import './App.css';
import Structure from './components/Structure';
import fleetData from './data/config';

function App() {

  return (
    <div style={{ height: '100vh' }}>
      <Structure data={fleetData} />
    </div>
  );
}
export default App;
