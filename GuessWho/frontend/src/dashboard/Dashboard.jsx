import { useState, useEffect } from "react";
import { supabase } from "../../../backend/server";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [gameId, setGameId] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [idInput, setIdInput] = useState("");
  const [user, setUser] = useState(null);
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("currentUserId");
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setUser(data);
    };

    fetchUser();
  }, []);

  // Function
  const handleHost = () => {
    if (!roomName) {
      alert("Please enter a room name.");
      return;
    }
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setGameId(randomId);
    setShowJoin(false);
    navigate(`/game-room/${randomId}`, { state: { roomName: roomName } });
  };
  const handleJoinClick = () => {
    setShowJoin(true);
    setGameId("");
  };
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!idInput) {
      alert("Please enter Game ID.");
      return;
    }
    alert("Joining game with ID: " + idInput);
  };

  return (
    <div className={styles.page}>
    <div className={styles.dashboardContainer}>
      {user && <div className={styles.userName}>Welcome, {user.username}</div>}

      <div className={styles.header}>
        <div className={styles.text}>Dashboard</div>
        <div className={styles.underline}></div>
      </div>
      {!showJoin && !gameId && (
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
      )}
      <div className={styles.buttonsSection}>
        <button className={styles.submit} onClick={handleHost}>
          {" "}
          Host a Game{" "}
        </button>
        <button className={styles.submit} onClick={handleJoinClick}>
          {" "}
          Join a Game{" "}
        </button>
      </div>
      {gameId && (
        <div className={styles.gameIdBox}>
          Room: {roomName} | Your Game ID: {gameId}
        </div>
      )}
      {showJoin && (
        <form onSubmit={handleJoinSubmit}>
          <div className={styles.inputs}>
          <div className={styles.input}>
              <input
                type="text"
                placeholder="Enter Game ID"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
              />
            </div>
          </div>
          <button className={styles.submit} type="submit">
            {" "}
            Join{" "}
          </button>
        </form>
      )}
    </div>
    </div>
  );
}

export default Dashboard;
