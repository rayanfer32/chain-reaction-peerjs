import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Peer } from "peerjs";
import { PeerContext } from "./context.js";
import { BASE_IDENTIFIER } from "./constants.js";

const peer = new Peer(
  BASE_IDENTIFIER + Math.random().toString(36).substring(2,7),
  // {
  //   host: "127.0.0.1",
  //   port: 8787,
  // }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <PeerContext.Provider value={peer}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </PeerContext.Provider>
);
