import './App.css';
import React from 'react';
import ConnectListener from './aws-connect-listener';
import isBrowserCompatible from './compatibility';

function App() {

  const cont = React.createRef();

  if (!isBrowserCompatible()) {
    return (
      <div className='App'>
        "Sorry, browser not supported. Please switch to one of the three latest versions of Chrome or Firefox."
      </div>
    )
  }

  else {
    const connectListener = new ConnectListener(cont.current, "https://ac-datamatics.my.connect.aws/ccp-v2");

    connectListener.onCallConnectingOrIncoming = (contact) => {
      alert("You have an incoming call ☎️");
    }
    connectListener.onCallMissed = () => {
      alert("Missed call 📞")
    }
    connectListener.onCallConnected = (contact) => {
      const connection = contact.getAgentConnection();
      alert("Connected to call. ID of connection is " + connection.getConnectionId());
    }
    connectListener.onCallError = () => {
      alert("error");
    }

    connectListener.onCallPending = () => {
      alert("Pending")
    }

    connectListener.onCallEnded = () => {
      alert("Ended")
    }
    connectListener.onCallDestroy = () => {
      alert("Call is destroyed");
    }
    connectListener.onCallACW = () => {
      alert("ACW");
    }

    return (
      <div className="App">
        <div ref={cont}></div>
      </div>
    );
  }
}

export default App;
