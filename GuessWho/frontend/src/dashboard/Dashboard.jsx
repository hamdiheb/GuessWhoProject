import { useState, useEffect } from "react";
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
    <div className="flex justify-center items-center min-h-[calc(100svh-40px)] p-5 bg-bg box-border">
      <div className="w-full max-w-[400px] bg-surface border border-border p-10 sm:p-12 rounded-lg shadow-card text-center animate-fade-slide-in">
        {user ? (
          <div className="inline-block text-sm font-semibold text-accent bg-accent-soft rounded-full py-1.5 px-4 mb-5">
            Welcome, {user.username}
          </div>
        ) : (
          <div className="inline-block text-sm font-semibold text-accent bg-accent-soft rounded-full py-1.5 px-4 mb-5">
            Loading...
          </div>
        )}

        <div>
          <div className="text-[28px] font-bold tracking-tight text-ink">Dashboard</div>
          <div className="h-[3px] w-[46px] bg-accent mx-auto mt-3.5 rounded-full" />
        </div>

        <div className="my-7">
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full py-3.5 px-4 bg-surface-2 border border-border rounded-md text-[15px] text-ink placeholder:text-ink-dim box-border transition-[border-color,box-shadow] duration-200 outline-none focus:border-accent-border focus:shadow-[0_0_0_4px_var(--color-accent-soft)]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleHost}
            className="py-[15px] rounded-full bg-accent text-[#17130b] text-[15px] font-bold cursor-pointer transition-[transform,filter,box-shadow] duration-200 ease-spring hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_8px_24px_var(--color-accent-glow)] active:scale-[0.99]"
          >
            Host a Game
          </button>
          <button
            onClick={handleJoinClick}
            className="py-[15px] rounded-full bg-transparent text-accent border border-accent-border text-[15px] font-bold cursor-pointer transition-[transform,background-color] duration-200 ease-spring hover:bg-accent-soft hover:scale-[1.02] active:scale-[0.99]"
          >
            Join a Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
