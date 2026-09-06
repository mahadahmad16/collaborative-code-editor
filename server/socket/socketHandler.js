import jwt from "jsonwebtoken";
import User from "../models/User.js";

import roomSocket from "./roomSocket.js";
import editorSocket from "./editorSocket.js";
import chatSocket from "./chatSocket.js";

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.userId).select(
        "-password"
      );

      if (!user) {
        return next(new Error("User no longer exists"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id} | User: ${socket.user.name}`
    );

    roomSocket(io, socket);
    editorSocket(io, socket);
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id} | User: ${socket.user.name}`
      );
    });
  });
};

export default socketHandler;