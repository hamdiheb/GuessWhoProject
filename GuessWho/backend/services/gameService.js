import * as gameRepository from "../repository/gameRepository.js";

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

  const { data: game, error } = await gameRepository.getGameByCodeInDB(game_code);
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
    const { data: userData } = await gameRepository.getUsersByIds(game.joined_users);
    if (userData) players = userData;
  }

  return { data: { ...game, players }, status: 200 };
}

export async function addQuestion(gameId, question) {
  const { data: currentGame, error } = await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  const newList = [...(currentGame.game_questions || []), question];
  const { error: updateError } = await gameRepository.updateQuestionsInDB(
    gameId,
    newList,
  );

  if (updateError) return { error: updateError.message, status: 400 };
  return { data: { game_questions: newList }, status: 200 };
}

export async function submitAnswer(gameId, { user_id, question_index, answer }) {
  if (!user_id || question_index === undefined || question_index === null || !answer) {
    return { error: "User, question index, and answer are required", status: 400 };
  }

  const { data: currentGame, error } = await gameRepository.getGameByIdInDB(gameId);
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

export async function launchGame(gameId, hostId) {
  const { data: currentGame, error } = await gameRepository.getGameByIdInDB(gameId);
  if (error || !currentGame) return { error: "Game not found", status: 404 };

  if (String(currentGame.host_id) !== String(hostId)) {
    return { error: "Only the host can launch this game", status: 403 };
  }

  const { error: updateError } = await gameRepository.launchGameInDB(gameId);
  if (updateError) return { error: updateError.message, status: 400 };

  return { data: { is_started: true }, status: 200 };
}
