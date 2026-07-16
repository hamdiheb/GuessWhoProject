import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";

const API_URL = import.meta.env.VITE_API_URL;

function JoinGame() {
  const [searchParams] = useSearchParams();
  const qrRoomCode = searchParams.get("code")?.trim() || "";
  const [roomCode, setRoomCode] = useState(qrRoomCode);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const joinGame = useCallback(async (code) => {
    if (!code) {
      setMessage("Please enter a room code.");
      return;
    }

    const userId = localStorage.getItem("currentUserId");

    if (!userId) {
      navigate("/signin", {
        state: { returnTo: `/join-game?code=${encodeURIComponent(code)}` },
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/games/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_code: code,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not join game.");
        return;
      }

      navigate(`/gamePlay/${data.id}`);
    } catch {
      setMessage("Cannot connect to the server.");
    }
  }, [navigate]);

  useEffect(() => {
    if (!qrRoomCode) return;

    const joinTimeout = window.setTimeout(() => joinGame(qrRoomCode), 0);
    return () => window.clearTimeout(joinTimeout);
  }, [joinGame, qrRoomCode]);

  const handleJoin = (e) => {
    e.preventDefault();
    joinGame(roomCode);
  };

  return (
    <div className="max-w-[460px] mx-auto my-16 px-5 animate-fade-slide-in">
      <div className="text-center mb-7">
        <h1 className="text-[30px]">Join a Game</h1>
      </div>

      <form
        className="p-9 border border-border rounded-lg bg-surface"
        onSubmit={handleJoin}
      >
        <h3 className="text-center mb-5 text-ink">Enter your room code</h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-1 py-3.5 px-4 bg-surface-2 border border-border rounded-md text-base text-ink placeholder:text-ink-dim placeholder:tracking-normal text-center tracking-[3px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent-border focus:shadow-[0_0_0_4px_var(--color-accent-soft)]"
          />
        </div>

        {message && (
          <p className="text-center text-danger bg-danger-soft py-2.5 px-3.5 rounded-sm mt-4 text-sm">
            {message}
          </p>
        )}

        <div className="flex gap-2.5 mt-5">
          <Button type="submit">Join Game</Button>
          <Button variant="secondary" type="button" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JoinGame;
