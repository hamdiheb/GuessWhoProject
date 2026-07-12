import * as authService from "../services/authService.js";

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await authService.signIn(email, password);

  if (error || !data) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  return res.status(200).json({
    id: data.id,
  });
};

export const signUp = (req, res) => {
  res.json({
    message: "Sign Up works",
  });
};