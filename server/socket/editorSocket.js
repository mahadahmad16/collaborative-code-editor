import Room from "../models/Room.js";
import Project from "../models/Project.js";

import {
  getFileLanguage,
  isValidFileName,
  normalizeFileName,
  normalizeFilePath,
} from "../utils/fileHelpers.js";

const getProjectForRoom = async (
  roomId,
  userId
) => {
  const room = await Room.findOne({
    roomId,
  });

  if (!room) {
    return {
      error: "Room not found",
    };
  }

  const isMember = room.members.some(
    (member) =>
      String(member.user) ===
      String(userId)
  );

  if (!isMember) {
    return {
      error: "You are not a member of this room",
    };
  }

  const project = await Project.findById(
    room.project
  );

  if (!project) {
    return {
      error: "Project not found",
    };
  }

  return {
    room,
    project,
  };
};

const editorSocket = (io, socket) => {
  socket.on(
    "code-change",
    async ({
      roomId,
      fileId,
      content,
    }) => {
      try {
        if (
          !roomId ||
          !fileId ||
          typeof content !== "string"
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          return;
        }

        const result =
          await getProjectForRoom(
            roomId,
            socket.user._id
          );

        if (result.error) {
          return;
        }

        const { project } = result;

        const file =
          project.files.id(fileId);

        if (!file) {
          return;
        }

        file.content = content;

        await project.save();

        socket
          .to(roomId)
          .emit("code-update", {
            fileId,
            content,
            userId:
              String(socket.user._id),
          });
      } catch (error) {
        console.error(
          "Code change error:",
          error
        );
      }
    }
  );

  socket.on(
    "file-create",
    async ({
      roomId,
      name,
      path,
      content = "",
    }) => {
      try {
        if (
          !roomId ||
          !name ||
          !path
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          return;
        }

        const fileName =
          normalizeFileName(name);

        const filePath =
          normalizeFilePath(path);

        if (
          !isValidFileName(fileName) ||
          !filePath
        ) {
          socket.emit(
            "socket-error",
            {
              message:
                "Invalid file name or path",
            }
          );

          return;
        }

        const result =
          await getProjectForRoom(
            roomId,
            socket.user._id
          );

        if (result.error) {
          socket.emit(
            "socket-error",
            {
              message:
                result.error,
            }
          );

          return;
        }

        const { project } = result;

        const existingFile =
          project.files.find(
            (file) =>
              file.path === filePath
          );

        if (existingFile) {
          socket.emit(
            "socket-error",
            {
              message:
                "A file with this path already exists",
            }
          );

          return;
        }

        const file =
          project.files.create({
            name: fileName,
            path: filePath,
            language:
              getFileLanguage(
                fileName
              ),
            content,
          });

        project.files.push(file);

        await project.save();

        const createdFile =
          project.files[
            project.files.length - 1
          ];

        io.to(roomId).emit(
          "file-created",
          {
            file: createdFile,
            userId:
              String(socket.user._id),
          }
        );
      } catch (error) {
        console.error(
          "File create error:",
          error
        );

        socket.emit(
          "socket-error",
          {
            message:
              "Unable to create file",
          }
        );
      }
    }
  );

  socket.on(
    "file-delete",
    async ({
      roomId,
      fileId,
    }) => {
      try {
        if (
          !roomId ||
          !fileId
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          return;
        }

        const result =
          await getProjectForRoom(
            roomId,
            socket.user._id
          );

        if (result.error) {
          return;
        }

        const { project } = result;

        const file =
          project.files.id(fileId);

        if (!file) {
          socket.emit(
            "socket-error",
            {
              message:
                "File not found",
            }
          );

          return;
        }

        const deletedFile = {
          id: String(file._id),
          name: file.name,
          path: file.path,
        };

        project.files.pull(fileId);

        await project.save();

        io.to(roomId).emit(
          "file-deleted",
          {
            file: deletedFile,
            userId:
              String(socket.user._id),
          }
        );
      } catch (error) {
        console.error(
          "File delete error:",
          error
        );

        socket.emit(
          "socket-error",
          {
            message:
              "Unable to delete file",
          }
        );
      }
    }
  );

  socket.on(
    "file-rename",
    async ({
      roomId,
      fileId,
      name,
      path,
    }) => {
      try {
        if (
          !roomId ||
          !fileId ||
          !name ||
          !path
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          return;
        }

        const fileName =
          normalizeFileName(name);

        const filePath =
          normalizeFilePath(path);

        if (
          !isValidFileName(fileName) ||
          !filePath
        ) {
          socket.emit(
            "socket-error",
            {
              message:
                "Invalid file name or path",
            }
          );

          return;
        }

        const result =
          await getProjectForRoom(
            roomId,
            socket.user._id
          );

        if (result.error) {
          return;
        }

        const { project } = result;

        const file =
          project.files.id(fileId);

        if (!file) {
          socket.emit(
            "socket-error",
            {
              message:
                "File not found",
            }
          );

          return;
        }

        const duplicate =
          project.files.find(
            (item) =>
              String(item._id) !==
                String(fileId) &&
              item.path === filePath
          );

        if (duplicate) {
          socket.emit(
            "socket-error",
            {
              message:
                "A file with this path already exists",
            }
          );

          return;
        }

        file.name = fileName;
        file.path = filePath;
        file.language =
          getFileLanguage(
            fileName
          );

        await project.save();

        io.to(roomId).emit(
          "file-renamed",
          {
            file: {
              id: String(file._id),
              name: file.name,
              path: file.path,
              language:
                file.language,
            },
            userId:
              String(socket.user._id),
          }
        );
      } catch (error) {
        console.error(
          "File rename error:",
          error
        );

        socket.emit(
          "socket-error",
          {
            message:
              "Unable to rename file",
          }
        );
      }
    }
  );
};

export default editorSocket;