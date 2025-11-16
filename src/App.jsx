import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Content from "./components/Content/Content";
import Timer from "./components/Timer/Timer";
import Chat from "./components/Chat/Chat";
import "./App.css";

export default function App() {
  const [route, setRoute] = useState("homepage");

  return (
    <div className="app">
      <Navbar route={route} setRoute={setRoute} />

      <div className={`main-layout ${route === "homepage" ? "homepage" : ""}`}>
        {route === "homepage" ? (
          <>
            <div className="timer-panel">
              <Timer />
            </div>
            <div className="chat-panel">
              <Chat />
            </div>
          </>
        ) : (
          <div className="content-panel">
            <Content route={route} />
          </div>
        )}
      </div>
    </div>
  );
}