import {
  createGameInDB,
  getGameByCodeInDB,
  getGameByIdInDB,
  updateJoinedUsersInDB,
  updateQuestionsInDB,
  getUsersByIds,
} from "../repository/gameRepository.js";

export const createGame = async (req, res) => {
  const { game_name, game_code, host_id, joined_users } = req.body;

  if (!game_name || !game_code || !host_id) {
    return res.status(400).json({ error: "Game name, code, and host are required" });
  }

  const { data, error } = await createGameInDB({
    game_name,
    game_code,
    host_id,
    joined_users: joined_users?.length ? joined_users : [host_id],
    game_questions: [],
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data);
};

export const joinGame = async (req, res) => {
  const { game_code, user_id } = req.body;

  if (!game_code || !user_id) {
    return res.status(400).json({ error: "Room code and user are required" });
  }

  const { data: game, error } = await getGameByCodeInDB(game_code);
  if (error || !game) {
    return res.status(404).json({ error: "Room not found" });
  }

  const users = game.joined_users || [];
  const alreadyJoined = users.some((id) => String(id) === String(user_id));

  if (alreadyJoined) {
    return res.json({ id: game.id, message: "You already joined this game" });
  }

  const { error: updateError } = await updateJoinedUsersInDB(game.id, [
    ...users,
    user_id,
  ]);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.json({ id: game.id, message: "Joined game successfully" });
};

export const getGame = async (req, res) => {
  const { data, error } = await getGameByIdInDB(req.params.id);
  if (error) return res.status(404).json({ error: "Game not found" });

  let players = [];
  if (data.joined_users && data.joined_users.length > 0) {
    const { data: userData } = await getUsersByIds(data.joined_users);
    if (userData) players = userData;
  }

  res.json({ ...data, players });
};

export const addQuestion = async (req, res) => {
  const { question } = req.body;
  const { id } = req.params;

  const { data: currentGame } = await getGameByIdInDB(id);
  const newList = [...(currentGame.game_questions || []), question];

  await updateQuestionsInDB(id, newList);
  res.json({ game_questions: newList });
};
