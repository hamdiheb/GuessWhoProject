import React, { useState } from "react";
import { supabase } from "../../../backend/server";
import styles from "./HostSetup.module.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";

function HostSetup() {
  const { gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const gameId = location.state?.gameId;

  const [question, setQuestion] = useState("");

  const handleAddQuestion = async () => {
    if (!question) return;

    const { data: currentGame } = await supabase
      .from("game")
      .select("game_questions")
      .eq("id", gameId)
      .single();
    const currentQuestions = currentGame?.game_questions || [];
    const updatedQuestions = [...currentQuestions, question];

    const { error } = await supabase
      .from("game")
      .update({ game_questions: updatedQuestions })
      .eq("id", gameId);

    if (error) {
      alert("Error adding question: " + error.message);
    } else {
      setQuestion("");
      alert("Question added!");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Setup Game</h2>
      <p>
        Invite Code: <strong>{gameCode}</strong>
      </p>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={handleAddQuestion}>Add Question</button>
      </div>

      <button
        className={styles.launchButton}
        onClick={() => navigate("/Gameplay")}
      >
        Launch Game
      </button>
    </div>
  );
}

export default HostSetup;
