import Room from "../models/Room.js";
import Project from "../models/Project.js";

import liveProjects from "./liveState.js";

const roomUsers = new Map();

const initializeLiveProject = async (
  roomId,
  projectId
) => {
  let liveProject =
    liveProjects.get(roomId);

  if (liveProject) {
    return liveProject;
  }

  const project =
    await Project.findById(projectId);

  if (!project) {
    return null;
  }

  liveProject = {
    projectId: String(project._id),

    files: project.files.map(
      (file) => ({
        id: String(file._id),
        name: file.name,
        path: file.path,
        language: file.language,
        content: file.content,
      })
    ),
  };

  liveProjects.set(
    roomId,
    liveProject
  );

  return liveProject;
};

const roomSocket = (
  io,
  socket
) => {
  socket.on(
    "join-room",
    async ({ roomId }) => {
      try {
        if (!roomId) {
          return;
        }

        const room =
          await Room.findOne({
            roomId,
          }).populate(
            "members.user",
            "name email avatar"
          );

        if (!room) {
          socket.emit(
            "socket-error",
            {
              message:
                "Room not found",
            }
          );

          return;
        }

        const currentMember =
          room.members.find(
            (member) =>
              String(
                member.user._id
              ) ===
              String(
                socket.user._id
              )
          );

        if (!currentMember) {
          socket.emit(
            "socket-error",
            {
              message:
                "You are not a member of this room",
            }
          );

          return;
        }

        if (
          socket.roomId &&
          socket.roomId !== roomId
        ) {
          handleLeaveRoom(
            io,
            socket
          );
        }

        socket.join(roomId);

        socket.roomId =
          roomId;

        socket.isRoomOwner =
          String(
            room.owner
          ) ===
          String(
            socket.user._id
          );

        if (
          !roomUsers.has(
            roomId
          )
        ) {
          roomUsers.set(
            roomId,
            new Map()
          );
        }

        const users =
          roomUsers.get(
            roomId
          );

        users.set(
          String(
            socket.user._id
          ),
          {
            id: String(
              socket.user._id
            ),
            name: socket.user.name,
            email: socket.user.email,
            avatar: socket.user.avatar,
            socketId:
              socket.id,
          }
        );

        const onlineUsers =
          Array.from(
            users.values()
          );

        socket.emit(
          "room-users",
          onlineUsers
        );

        socket.to(roomId).emit(
          "user-joined",
          {
            id: String(
              socket.user._id
            ),
            name: socket.user.name,
            email: socket.user.email,
            avatar: socket.user.avatar,
          }
        );

        if (room.project) {
          const liveProject =
            await initializeLiveProject(
              roomId,
              room.project
            );

          if (liveProject) {
            socket.emit(
              "initial-state",
              {
                projectId:
                  liveProject.projectId,
                files:
                  liveProject.files,
              }
            );
          }
        }

        console.log(
          `${socket.user.name} joined room ${roomId}`
        );
      } catch (error) {
        console.error(
          "Join room socket error:",
          error.message
        );

        socket.emit(
          "socket-error",
          {
            message:
              "Unable to join room",
          }
        );
      }
    }
  );

  socket.on(
    "leave-room",
    () => {
      handleLeaveRoom(
        io,
        socket
      );
    }
  );

  socket.on(
    "room-deleted",
    ({ roomId }) => {
      if (
        !roomId ||
        socket.roomId !== roomId ||
        !socket.isRoomOwner
      ) {
        return;
      }

      socket.to(roomId).emit(
        "room-deleted"
      );

      roomUsers.delete(
        roomId
      );

      liveProjects.delete(
        roomId
      );

      io.in(roomId).socketsLeave(
        roomId
      );

      socket.roomId = null;
      socket.isRoomOwner = false;

      console.log(
        `${socket.user.name} deleted room ${roomId}`
      );
    }
  );

  socket.on(
    "disconnect",
    () => {
      handleLeaveRoom(
        io,
        socket
      );
    }
  );
};

const handleLeaveRoom = (
  io,
  socket
) => {
  const roomId =
    socket.roomId;

  if (!roomId) {
    return;
  }

  const users =
    roomUsers.get(
      roomId
    );

  if (users) {
    users.delete(
      String(
        socket.user._id
      )
    );

    if (users.size === 0) {
      roomUsers.delete(
        roomId
      );
    } else {
      socket.to(roomId).emit(
        "user-left",
        {
          id: String(
            socket.user._id
          ),
          name:
            socket.user.name,
        }
      );
    }
  }

  socket.leave(roomId);

  socket.roomId = null;
  socket.isRoomOwner = false;
};

export default roomSocket;