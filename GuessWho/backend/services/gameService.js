import * as gameRepository from "../repository/gameRepository.js";
import { generateQuestionsFromPrompt } from "./aiService.js";

export async function createGame(gameData) {
  const { game_name, game_code, host_id, joined_users } = gameData;

  if (!game_name || !game_code || !host_id) {
    return {
      error: "Game name, code, and host are required",
      status: 400,
    };
  }

  const { data, error } = await gameRepository.createGameInDB({
    game_name,
    game_code,
    host_id,
    joined_users: joined_users?.length ? joined_users : [host_id],
    game_questions: [],
  });

  if (error) return { error: error.message, status: 400 };
  return { data, status: 201 };
}

export async function joinGame({ game_code, user_id }) {
  if (!game_code || !user_id) {
    return { error: "Room code and user are required", status: 400 };
  }

  const { data: game, error } =
    await gameRepository.getGameByCodeInDB(game_code);
  if (error || !game) return { error: "Room not found", status: 404 };

  const users = game.joined_users || [];
  const alreadyJoined = users.some((id) => String(id) === String(user_id));

  if (alreadyJoined) {
    return {
      data: { id: game.id, message: "You already joined this game" },
      status: 200,
    };
  }

  const { error: updateError } = await gameRepository.updateJoinedUsersInDB(
    game.id,
    [...users, user_id],
  );

  if (updateError) return { error: updateError.message, status: 400 };

  return {
    data: { id: game.id, message: "Joined game successfully" },
    status: 200,
  };
}

export async function getGame(gameId) {
  const { data: game, error } = await gameRepository.getGameByIdInDB(gameId);
  if (error || !game) return { error: "Game not found", status: 404 };

  let players = [];
  if (game.joined_users?.length) {
    const { data: userData } = await gameRepository.getUsersByIds(
      game.joined_users,
    );
    if (userData) players = userData;
  }

  return { data: { ...game, players }, status: 200 };
}

export async function addQuestion(gameId, question) {
  const { data: currentGame, error } =
    await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  const newList = [...(currentGame.game_questions || []), question];
  const { error: updateError } = await gameRepository.updateQuestionsInDB(
    gameId,
    newList,
  );

  if (updateError) return { error: updateError.message, status: 400 };
  return { data: { game_questions: newList }, status: 200 };
}

export async function generateQuestions(gameId, prompt) {
  if (!prompt || !prompt.trim()) {
    return { error: "Prompt is required", status: 400 };
  }

  const { data: currentGame, error } = await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  let generated;
  try {
    generated = await generateQuestionsFromPrompt(prompt);
  } catch (err) {
    return { error: err.message || "Failed to generate questions", status: 502 };
  }

  if (generated.length === 0) {
    return { error: "AI did not return any questions", status: 502 };
  }

  const newList = [...(currentGame.game_questions || []), ...generated];
  const { error: updateError } = await gameRepository.updateQuestionsInDB(gameId, newList);
  if (updateError) return { error: updateError.message, status: 400 };

  return { data: { game_questions: newList }, status: 200 };
}

export async function submitAnswer(gameId, { user_id, question_index, answer }) {
  if (!user_id || question_index === undefined || question_index === null || !answer) {
    return { error: "User, question index, and answer are required", status: 400 };
  }

  const { data: currentGame, error } =
    await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  const question = currentGame.game_questions?.[question_index];
  if (question === undefined) {
    return { error: "Invalid question index", status: 400 };
  }

  const answersList = [...(currentGame.game_answers || [])];
  while (answersList.length <= question_index) {
    answersList.push(null);
  }

  const entry = answersList[question_index] || { question, answers: {} };
  answersList[question_index] = {
    question,
    answers: { ...entry.answers, [user_id]: answer },
  };

  const { error: updateError } = await gameRepository.updateAnswersInDB(
    gameId,
    answersList,
  );

  if (updateError) return { error: updateError.message, status: 400 };
  return { data: { game_answers: answersList }, status: 200 };
}

function isAllAnswered(game) {
  const questions = game.game_questions || [];
  const users = game.joined_users || [];
  if (questions.length === 0 || users.length === 0) return false;
  return questions.every((_, qIdx) =>
    users.every(
      (uid) => game.game_answers?.[qIdx]?.answers?.[uid] !== undefined,
    ),
  );
}

export async function submitGuess(
  gameId,
  { user_id, question_index, author_id, guessed_user_id },
) {
  if (
    !user_id ||
    question_index === undefined ||
    question_index === null ||
    !author_id ||
    !guessed_user_id
  ) {
    return {
      error: "User, question index, author, and guessed user are required",
      status: 400,
    };
  }

  const { data: currentGame, error } =
    await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  if (!currentGame.is_started) {
    return { error: "Game has not started", status: 400 };
  }

  const question = currentGame.game_questions?.[question_index];
  if (question === undefined) {
    return { error: "Invalid question index", status: 400 };
  }

  const joinedUsers = currentGame.joined_users || [];
  const isJoined = (id) => joinedUsers.some((u) => String(u) === String(id));
  if (!isJoined(user_id) || !isJoined(author_id)) {
    return { error: "User or author is not part of this game", status: 400 };
  }

  if (String(author_id) === String(user_id)) {
    return { error: "You cannot guess your own answer", status: 400 };
  }

  const authorAnswer =
    currentGame.game_answers?.[question_index]?.answers?.[author_id];
  if (authorAnswer === undefined) {
    return {
      error: "This author has not answered this question yet",
      status: 400,
    };
  }

  if (!isAllAnswered(currentGame)) {
    return {
      error: "Not all players have finished answering yet",
      status: 400,
    };
  }

  const guesses = currentGame.game_guesses ? [...currentGame.game_guesses] : [];
  while (guesses.length <= question_index) guesses.push(null);

  const slotForQuestion = guesses[question_index] || {};
  const authorGuesses = slotForQuestion[author_id] || {};

  if (authorGuesses[user_id] !== undefined) {
    const storedGuess = authorGuesses[user_id];
    return {
      data: {
        correct: String(storedGuess) === String(author_id),
        author_id,
        game_guesses: guesses,
        game_scores: currentGame.game_scores || {},
      },
      status: 200,
    };
  }

  const correct = String(guessed_user_id) === String(author_id);

  guesses[question_index] = {
    ...slotForQuestion,
    [author_id]: { ...authorGuesses, [user_id]: guessed_user_id },
  };

  const scores = { ...(currentGame.game_scores || {}) };
  if (correct) {
    scores[user_id] = (scores[user_id] || 0) + 1;
  }

  const { error: updateError } = await gameRepository.updateGuessesInDB(
    gameId,
    {
      game_guesses: guesses,
      game_scores: scores,
    },
  );

  if (updateError) return { error: updateError.message, status: 400 };

  return {
    data: { correct, author_id, game_guesses: guesses, game_scores: scores },
    status: 200,
  };
}

export async function launchGame(gameId, hostId) {
  const { data: currentGame, error } =
    await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  if (String(currentGame.host_id) !== String(hostId)) {
    return { error: "Only the host can launch this game", status: 403 };
  }

  const { error: updateError } = await gameRepository.launchGameInDB(gameId);
  if (updateError) return { error: updateError.message, status: 400 };

  return { data: { is_started: true }, status: 200 };
}

export async function getRelationshipScores(gameId) {
  const { data: currentGame, error } =
    await gameRepository.getGameByIdInDB(gameId);

  if (error || !currentGame) {
    return {
      error: "Game not found",
      status: 404,
    };
  }
  const relationships = {};

  for (const question of currentGame.game_guesses || []) {
    for (const authorId in question) {
      for (const guesserId in question[authorId]) {
        const guessedUserId = question[authorId][guesserId];
       
        if (!relationships[guesserId]) {
          relationships[guesserId] = {};
        }

        if (!relationships[guesserId][authorId]) {
          relationships[guesserId][authorId] = {
            correct: 0,
            total: 0,
          };
        }

        relationships[guesserId][authorId].total++;

        if (String(guessedUserId) === String(authorId)) {
          relationships[guesserId][authorId].correct++;
        }
      }
    }
  }

  const results = [];

  for (const guesserId in relationships) {
    for (const authorId in relationships[guesserId]) {
      const stats = relationships[guesserId][authorId];

      const percentage = Math.round((stats.correct / stats.total) * 100);

      results.push({
        guesserId,
        authorId,
        percentage,
      });
    }
  }
  return {
    data: results,
    status: 200,
  };
}
