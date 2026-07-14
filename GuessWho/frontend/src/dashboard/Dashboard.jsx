import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (userId) {
      fetch(`${API_URL}/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
        })
        .catch((err) => console.error("Error:", err));
    }
  }, []);

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

    try {
      const response = await fetch(`${API_URL}/api/games/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_name: roomName,
          game_code: randomCode,
          host_id: hostId,
          joined_users: [hostId],
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create game");

      navigate(`/host-setup/${randomCode}`, {
        state: { gameId: data.id, gameName: roomName },
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleJoinClick = () => {
    navigate("/join-game");
  };

  return (
    <div className={styles.page}>
      <div className={styles.dashboardContainer}>
        {user ? (
          <div className={styles.welcome}>Welcome, {user.username}</div>
        ) : (
          <div className={styles.welcome}>Loading...</div>
        )}

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
