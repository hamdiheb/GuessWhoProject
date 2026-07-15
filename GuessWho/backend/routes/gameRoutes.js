import express from "express";
import {
  createGame,
  joinGame,
  getGame,
  addQuestion,
  submitAnswer,
  submitGuess,
  launchGame,
} from "../controllers/gameController.js";


const router = express.Router();
router.post("/create", createGame);
router.post("/join", joinGame);
router.get("/:id", getGame);
router.post("/:id/add-question", addQuestion);
router.post("/:id/answer", submitAnswer);
router.post("/:id/guess", submitGuess);
router.post("/:id/launch", launchGame);

export default router;
