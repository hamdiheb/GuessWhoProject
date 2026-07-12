import express from "express";
import {
  createGame,
  joinGame,
  getGame,
  addQuestion,
} from "../controllers/gameController.js";


const router = express.Router();
router.post("/create", createGame);
router.post("/join", joinGame);
router.get("/:id", getGame);
router.post("/:id/add-question", addQuestion);

export default router;
