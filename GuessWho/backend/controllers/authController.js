import * as authService from "../services/authService.js";

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const { data, error } = await authService.signIn(email, password);

    if (error || !data) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      id: data.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const { data, error } = await authService.signUp(username, email, password);

    if (error) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      id: data.id,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
