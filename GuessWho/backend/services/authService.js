import * as authRepository from '../repository/authRepository.js'

export async function signIn(email, password) {
  return authRepository.signIn(email, password)
}

export async function signUp(username, email, password) {
  const existingUser = await authRepository.getUserByEmail(email)
  console.log(existingUser)
  if (existingUser.data) {
    return {
      data: null,
      error: {
        message: 'User with this email already exists',
      },
    }
  }

  return authRepository.signUp(username, email, password)
}
