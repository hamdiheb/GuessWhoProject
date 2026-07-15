import * as authRepository from "../repository/authRepository.js";
import { generateToken } from "../utils/jwt.js";

export async function signIn(email, password) {
  const { data, error } = await authRepository.signIn(email, password);

  if (error || !data) {
    return { data, error };
  }

  const token = generateToken(data.id);

  return {
    data: {
      id: data.id,
      token,
    },
    error: null,
  };
}

export async function signUp(username, email, password) {
  const existingUser = await authRepository.getUserByEmail(email);

  if (existingUser.data) {
    return {
      data: null,
      error: {
        message: 'User with this email already exists',
      },
    };
  }

  return authRepository.signUp(username, email, password);
}