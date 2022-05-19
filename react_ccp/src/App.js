import './App.css';
import React from 'react';
import isBrowserCompatible from './compatibility';
import CCP from './CCP';

function App() {

    return (
      <div className="App">
        <div id={"ccp"}>
          {isBrowserCompatible() && <CCP instanceURL={"https://ac-datamatics.my.connect.aws/ccp-v2"} />}
        </div>
      </div>
    );
  }

export default App;
