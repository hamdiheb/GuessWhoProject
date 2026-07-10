import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./GameRoom.css";

function GameRoom() {
  const { roomCode } = useParams();
  const location = useLocation();
  const roomName = location.state?.roomName || "Unknown Room";

  const [questionType, setQuestionType] = useState("programming");
  const [players, setPlayers] = useState(["Iheb", "Alex", "Sahim" , "Hammad"]);

  return (
    <div className="gameroom-container">
      <div className="room-info-header">
        <h2>{roomName}</h2>
        <p>
          Room Code: <span className="code-text">{roomCode}</span>
        </p>
      </div>

      <div className="options-group">
        <label className="option-label">
          <input
            type="radio"
            name="qType"
            value="programming"
            checked={questionType === "programming"}
            onChange={(e) => setQuestionType(e.target.value)}
          />
          Programming Questions
        </label>

        <label className="option-label">
          <input
            type="radio"
            name="qType"
            value="soft"
            checked={questionType === "soft"}
            onChange={(e) => setQuestionType(e.target.value)}
          />
          Soft Questions
        </label>

        <label className="option-label">
          <input
            type="radio"
            name="qType"
            value="random"
            checked={questionType === "random"}
            onChange={(e) => setQuestionType(e.target.value)}
          />
          Random Questions
        </label>
      </div>

      <div className="content-section">
        <div className="players-list">
          {players.map((player, index) => (
            <div key={index} className="player-item">
              {player} | Joined
            </div>
          ))}
        </div>

        <div className="start-btn-box">
          <button className="start-button">Start</button>
        </div>
      </div>
    </div>
  );
}

export default GameRoom;
