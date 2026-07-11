import React, { useState } from "react";
/* import { supabase } from "../../../backend/server";
 */
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  const handleHost = async () => {
    if (!roomName) {
      alert("Please enter a room name.");
      return;
    }

    const hostId = localStorage.getItem("currentUserId");
    if (!hostId) {
      alert("You must be logged in to host a game.");
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);

    const { data, error } = await supabase
      .from("game")
      .insert({
        game_name: roomName,
        game_code: randomCode,
        host_id: hostId,
      })
      .select()
      .single();

    if (error) {
      alert("Failed to create game: " + error.message);
      return;
    }

    navigate(`/host-setup/${randomCode}`, { state: { gameId: data.id } });
  };

  const handleJoinClick = () => {
    navigate("/join-game");
  };

  return (
    <div className={styles.page}>
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <div className={styles.text}>Dashboard</div>
          <div className={styles.underline}></div>
        </div>

        <div className={styles.inputs}>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Enter Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.buttonsSection}>
          <button className={styles.submit} onClick={handleHost}>
            Host a Game
          </button>
          <button className={styles.submit} onClick={handleJoinClick}>
            Join a Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
