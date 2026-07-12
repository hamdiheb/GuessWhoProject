import { useState, useEffect } from "react";
import { supabase } from "../../../backend/server";
import styles from "./HostSetup.module.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";

function HostSetup() {
  const { gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const gameId = location.state?.gameId;

  const [gameName, setGameName] = useState("Loading...");
  const [question, setQuestion] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const loadData = async () => {
      const { data } = await supabase
        .from("game")
        .select("game_name, game_questions, joined_users")
        .eq("id", gameId)
        .single();

      if (data) {
        setGameName(data.game_name);
        setQuestionsList(data.game_questions || []);

        if (data.joined_users && data.joined_users.length > 0) {
          const { data: users } = await supabase
            .from("users")
            .select("username")
            .in("id", data.joined_users);

          if (users) setPlayers(users);
        }
      }
    };

    loadData();

    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `id=eq.${gameId}`,
        },
        () => {
          loadData();
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [gameId]);

  const addQuestion = async () => {
    if (question === "") return;

    const newList = [...questionsList, question];

    await supabase
      .from("game")
      .update({ game_questions: newList })
      .eq("id", gameId);

    setQuestionsList(newList);
    setQuestion("");
  };

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <h1>{gameName}</h1>
        <p>
          Room Code: <strong>{gameCode}</strong>
        </p>
      </header>

      <div className={styles.dashboard}>
        <section className={styles.card}>
          <h3>Questions</h3>
          <div className={styles.inputArea}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Add question..."
            />
            <button onClick={addQuestion}>Add</button>
          </div>
          <ul className={styles.list}>
            {questionsList.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h3>Players ({players.length})</h3>
          <ul className={styles.list}>
            {players.map((p, i) => (
              <li key={i}>{p.username}</li>
            ))}
          </ul>
        </section>
      </div>

      <button
        className={styles.launchBtn}
        disabled={questionsList.length === 0 || players.length === 1}
        onClick={() => navigate("/Gameplay")}
      >
        Launch Game
      </button>
    </div>
  );
}

export default HostSetup;
