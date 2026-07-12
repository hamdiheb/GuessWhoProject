import * as userRepository from "../repository/userRepository.js";

export const getUser = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await userRepository.getUserById(id);

  if (error) return res.status(404).json({ error: "User not found" });
  res.json(data);
};
