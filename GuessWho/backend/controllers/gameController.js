import * as gameService from "../services/gameService.js";

export const createGame = async (req, res) => {
  const { data, error, status } = await gameService.createGame(req.body);
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};

export const joinGame = async (req, res) => {
  const { data, error, status } = await gameService.joinGame(req.body);
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};

export const getGame = async (req, res) => {
  const { data, error, status } = await gameService.getGame(req.params.id);
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};

export const addQuestion = async (req, res) => {
  const { data, error, status } = await gameService.addQuestion(
    req.params.id,
    req.body.question,
  );
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};

export const submitAnswer = async (req, res) => {
  const { data, error, status } = await gameService.submitAnswer(
    req.params.id,
    req.body,
  );
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};

export const launchGame = async (req, res) => {
  const { data, error, status } = await gameService.launchGame(
    req.params.id,
    req.body.host_id,
  );
  if (error) return res.status(status).json({ error });
  return res.status(status).json(data);
};
