const chatSocket = (io, socket) => {
  socket.on(
    "chat-message",
    ({ roomId, message }) => {
      try {
        if (!roomId || !message?.trim()) {
          return;
        }

        if (socket.roomId !== roomId) {
          return;
        }

        const chatMessage = {
          id: `${Date.now()}-${socket.id}`,
          roomId,
          user: {
            id: String(socket.user._id),
            name: socket.user.name,
            avatar: socket.user.avatar,
          },
          message: message.trim(),
          createdAt: new Date().toISOString(),
        };

        io.to(roomId).emit(
          "chat-message",
          chatMessage
        );
      } catch (error) {
        console.error(
          "Chat socket error:",
          error
        );
      }
    }
  );
};

export default chatSocket;