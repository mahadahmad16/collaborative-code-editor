import Room from "../models/Room.js";
import Project from "../models/Project.js";

import liveProjects from "./liveState.js";

import {
  getLanguageFromExtension,
} from "../utils/fileHelpers.js";

import {
  executeCode,
} from "../services/codeExecutionService.js";

const saveTimers = new Map();

const getFileId = (file) =>
  String(file?.id || file?._id || "");

const getLiveProject = (roomId) => {
  return liveProjects.get(roomId);
};

const initializeLiveProject = async (roomId, projectId) => {
  let liveProject = liveProjects.get(roomId);

  if (liveProject) {
    return liveProject;
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return null;
  }

  liveProject = {
    projectId: String(project._id),
    files: project.files.map((file) => ({
      id: String(file._id),
      name: file.name,
      path: file.path,
      language: file.language,
      content: file.content,
    })),
  };

  liveProjects.set(roomId, liveProject);

  return liveProject;
};

const scheduleFileSave = (
  roomId,
  projectId,
  fileId
) => {
  const timerKey = `${roomId}:${fileId}`;

  const existingTimer = saveTimers.get(timerKey);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    try {
      const liveProject = liveProjects.get(roomId);

      if (!liveProject) {
        return;
      }

      const liveFile = liveProject.files.find(
        (file) => String(file.id) === String(fileId)
      );

      if (!liveFile) {
        return;
      }

      await Project.updateOne(
        {
          _id: projectId,
          "files._id": fileId,
        },
        {
          $set: {
            "files.$.content": liveFile.content,
          },
        }
      );

      console.log(
        `File saved to database: ${fileId}`
      );
    } catch (error) {
      console.error(
        "Debounced file save error:",
        error.message
      );
    } finally {
      const currentTimer = saveTimers.get(timerKey);

      if (currentTimer === timer) {
        saveTimers.delete(timerKey);
      }
    }
  }, 1000);

  saveTimers.set(timerKey, timer);
};

const editorSocket = (io, socket) => {

  socket.on(
  "cursor-move",
  ({
    roomId,
    fileId,
    position,
    selection,
  }) => {
    try {
      if (
        !roomId ||
        !fileId ||
        !position ||
        socket.roomId !== roomId
      ) {
        return;
      }

      socket.to(roomId).emit(
        "cursor-move",
        {
          userId: String(socket.user._id),
          userName: socket.user.name,
          fileId,
          position,
          selection,
        }
      );
    } catch (error) {
      console.error(
        "Cursor move socket error:",
        error.message
      );
    }
  }
);


  socket.on(
    "code-change",
    async ({ roomId, fileId, content }) => {
      try {
        if (
          !roomId ||
          !fileId ||
          typeof content !== "string"
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          socket.emit("socket-error", {
            message: "You are not connected to this room",
          });

          return;
        }

        const liveProject = getLiveProject(roomId);

        if (!liveProject) {
          socket.emit("socket-error", {
            message: "Project state is not available",
          });

          return;
        }

        const file = liveProject.files.find(
          (item) =>
            String(item.id) === String(fileId)
        );

        if (!file) {
          socket.emit("socket-error", {
            message: "File not found",
          });

          return;
        }

        file.content = content;

        socket.to(roomId).emit("code-update", {
          fileId,
          content,
          userId: String(socket.user._id),
        });

        scheduleFileSave(
          roomId,
          liveProject.projectId,
          fileId
        );
      } catch (error) {
        console.error(
          "Code change socket error:",
          error.message
        );
      }
    }
  );

  socket.on(
  "run-code",
  async ({
    roomId,
    fileId,
    language,
    code,
    stdin = "",
  }) => {
    try {
      if (
  !roomId ||
  !fileId ||
  typeof code !== "string"
) {
        socket.emit(
          "code-output",
          {
            success: false,
            output:
              "Invalid code execution request.",
            error:
              "Missing execution data.",
          }
        );

        return;
      }

      if (socket.roomId !== roomId) {
        socket.emit(
          "code-output",
          {
            success: false,
            output:
              "You are not connected to this room.",
            error:
              "Invalid room.",
          }
        );

        return;
      }

      const liveProject =
        liveProjects.get(roomId);

      if (!liveProject) {
        socket.emit(
          "code-output",
          {
            success: false,
            output:
              "Project state is not available.",
            error:
              "Project state not found.",
          }
        );

        return;
      }

      const file =
        liveProject.files.find(
          (item) =>
            String(item.id) ===
            String(fileId)
        );

      if (!file) {
        socket.emit(
          "code-output",
          {
            success: false,
            output:
              "File not found.",
            error:
              "The selected file does not exist.",
          }
        );

        return;
      }

      console.log("Executing code:", {
  language,
  fileId,
  stdin: JSON.stringify(stdin),
});

  const executionLanguage =
    file.language || language;

  const result =
    await executeCode({
      language: executionLanguage,
      code,
      stdin,
  });

      const outputParts = [];

      if (result.stdout) {
        outputParts.push(
          result.stdout.trimEnd()
        );
      }

      if (result.stderr) {
        outputParts.push(
          result.stderr.trimEnd()
        );
      }

      if (result.compileOutput) {
        outputParts.push(
          result.compileOutput.trimEnd()
        );
      }

      if (result.message) {
        outputParts.push(
          result.message
        );
      }

      socket.emit(
        "code-output",
        {
          success:
            result.status?.id === 3,
          output:
            outputParts.join("\n"),
          stdout:
            result.stdout,
          stderr:
            result.stderr,
          compileOutput:
            result.compileOutput,
          status:
            result.status,
          time:
            result.time,
          memory:
            result.memory,
        }
      );
    } catch (error) {
      console.error(
        "Code execution error:",
        error.message
      );

      socket.emit(
        "code-output",
        {
          success: false,
          output:
            error.message ||
            "Unable to execute code.",
          error:
            error.message,
        }
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
          !name?.trim() ||
          !path?.trim()
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          socket.emit("socket-error", {
            message: "You are not connected to this room",
          });

          return;
        }

        const liveProject =
          getLiveProject(roomId);

        if (!liveProject) {
          return;
        }

        const normalizedName = name.trim();
        const normalizedPath = path.trim();

        const duplicate = liveProject.files.some(
          (file) =>
            file.path === normalizedPath ||
            file.name === normalizedName
        );

        if (duplicate) {
          socket.emit("socket-error", {
            message: "A file with this name already exists",
          });

          return;
        }

        const project =
          await Project.findById(
            liveProject.projectId
          );

        if (!project) {
          return;
        }

        const newFile = project.files.create({
          name: normalizedName,
          path: normalizedPath,
          language: getLanguageFromExtension(normalizedName),
          content,
        });

        project.files.push(newFile);

        await project.save();

        const file = {
          id: String(newFile._id),
          name: newFile.name,
          path: newFile.path,
          language: newFile.language,
          content: newFile.content,
        };

        liveProject.files.push(file);

        io.to(roomId).emit("file-created", {
          file,
          userId: String(socket.user._id),
        });

        console.log(
          `${socket.user.name} created ${file.name}`
        );
      } catch (error) {
        console.error(
          "File create socket error:",
          error.message
        );

        socket.emit("socket-error", {
          message: "Unable to create file",
        });
      }
    }
  );

  socket.on(
    "file-delete",
    async ({ roomId, fileId }) => {
      try {
        if (!roomId || !fileId) {
          return;
        }

        if (socket.roomId !== roomId) {
          socket.emit("socket-error", {
            message: "You are not connected to this room",
          });

          return;
        }

        const liveProject =
          getLiveProject(roomId);

        if (!liveProject) {
          return;
        }

        const fileIndex =
          liveProject.files.findIndex(
            (file) =>
              String(file.id) ===
              String(fileId)
          );

        if (fileIndex === -1) {
          socket.emit("socket-error", {
            message: "File not found",
          });

          return;
        }

        if (liveProject.files.length <= 1) {
          socket.emit("socket-error", {
            message:
              "A project must contain at least one file",
          });

          return;
        }

        const project =
          await Project.findById(
            liveProject.projectId
          );

        if (!project) {
          return;
        }

        project.files.pull(fileId);

        await project.save();

        const [deletedFile] =
          liveProject.files.splice(
            fileIndex,
            1
          );

        const timerKey =
          `${roomId}:${fileId}`;

        const timer =
          saveTimers.get(timerKey);

        if (timer) {
          clearTimeout(timer);
          saveTimers.delete(timerKey);
        }

        io.to(roomId).emit(
          "file-deleted",
          {
            file: deletedFile,
            userId: String(socket.user._id),
          }
        );

        console.log(
          `${socket.user.name} deleted ${deletedFile.name}`
        );
      } catch (error) {
        console.error(
          "File delete socket error:",
          error.message
        );

        socket.emit("socket-error", {
          message: "Unable to delete file",
        });
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
          !name?.trim() ||
          !path?.trim()
        ) {
          return;
        }

        if (socket.roomId !== roomId) {
          socket.emit("socket-error", {
            message: "You are not connected to this room",
          });

          return;
        }

        const liveProject =
          getLiveProject(roomId);

        if (!liveProject) {
          return;
        }

        const file =
          liveProject.files.find(
            (item) =>
              String(item.id) ===
              String(fileId)
          );

        if (!file) {
          socket.emit("socket-error", {
            message: "File not found",
          });

          return;
        }

        const normalizedName =
          name.trim();

        const normalizedPath =
          path.trim();

        const duplicate =
          liveProject.files.some(
            (item) =>
              String(item.id) !==
                String(fileId) &&
              item.path === normalizedPath
          );

        if (duplicate) {
          socket.emit("socket-error", {
            message:
              "A file with this name already exists",
          });

          return;
        }

        const project =
          await Project.findById(
            liveProject.projectId
          );

        if (!project) {
          return;
        }

        const projectFile =
          project.files.id(fileId);

        if (!projectFile) {
          return;
        }

        const newLanguage =
  getLanguageFromExtension(
    normalizedName
  );

        projectFile.name = normalizedName;
        projectFile.path = normalizedPath;
        projectFile.language = newLanguage;

        await project.save();

        file.name = normalizedName;
        file.path = normalizedPath;
        file.language = newLanguage;

        io.to(roomId).emit(
          "file-renamed",
          {
            file: { ...file },
            userId: String(socket.user._id),
          }
        );

        console.log(
          `${socket.user.name} renamed file to ${normalizedName}`
        );
      } catch (error) {
        console.error(
          "File rename socket error:",
          error.message
        );

        socket.emit("socket-error", {
          message: "Unable to rename file",
        });
      }
    }
  );
};

export default editorSocket;