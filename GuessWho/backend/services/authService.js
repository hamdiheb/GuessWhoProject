import * as authRepository from "../repository/authRepository.js";

export async function signIn(email, password) {
  return await authRepository.signIn(email, password);
}