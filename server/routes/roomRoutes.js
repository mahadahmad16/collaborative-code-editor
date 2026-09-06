import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createRoom,
  getUserRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createRoom);

router.get("/", getUserRooms);

router.get("/:roomId", getRoom);

router.post("/:roomId/join", joinRoom);

router.delete("/:roomId/leave", leaveRoom);

router.delete("/:roomId", deleteRoom);

export default router;