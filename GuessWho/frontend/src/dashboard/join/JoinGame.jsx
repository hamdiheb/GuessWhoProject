import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./JoinGame.module.css";

function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!roomCode) {
      setMessage("Please enter a room code.");
      return;
    }

    const userId = localStorage.getItem("currentUserId");

    if (!userId) {
      setMessage("Please sign in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_code: roomCode,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not join game.");
        return;
      }

      navigate("/gamePlay", { state: { gameId: data.id } });
    } catch {
      setMessage("Cannot connect to the server.");
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <h1>Join a Game</h1>
      </div>

      <form className={styles.card} onSubmit={handleJoin}>
        <h3>Enter your room code</h3>
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </div>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.buttonArea}>
          <button className={styles.joinBtn} type="submit">
            Join Game
          </button>
          <button
            className={styles.backBtn}
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default JoinGame;
