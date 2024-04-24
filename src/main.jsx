import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Peer } from 'peerjs';

const BASE_IDENTIFIER = 'chain-reaction-multiplayer-';
const peer = new Peer(
  BASE_IDENTIFIER + Math.random().toString(36).substring(2),
  {
    host: '127.0.0.1',
    port: 8787,
  }
);
export const PeerContext = React.createContext();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PeerContext.Provider value={peer}>
      <App />
    </PeerContext.Provider>
  </React.StrictMode>
);
