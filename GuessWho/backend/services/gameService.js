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
