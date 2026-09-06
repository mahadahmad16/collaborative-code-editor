import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import EditorTabs from "../components/EditorTabs";
import CodeEditor from "../components/CodeEditor";
import Terminal from "../components/Terminal";
import UserList from "../components/UserList";
import ChatPanel from "../components/ChatPanel";
import RoomHeader from "../components/RoomHeader";
import Loading from "../components/Loading";

import useAuth from "../hooks/useAuth";
import useEditor from "../hooks/useEditor";
import useSocket from "../hooks/useSocket";

import { api } from "../services/api";
import { SOCKET_EVENTS } from "../utils/constants";
import { getErrorMessage } from "../utils/helpers";

const getFileId = (file) =>
  file?.id || file?._id || file?.path;

const Editor = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const {
    room,
    setRoom,
    files,
    setFiles,
    openFiles,
    activeFile,
    language,
    output,
    isRunning,
    selectFile,
    closeFile,
    updateFileContent,
    updateFile,
    setOutput,
    setIsRunning,
    resetEditor,
  } = useEditor();

  const { socket, connected } =
    useSocket(token);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] =
    useState("");

  const isRemoteUpdate =
    useRef(false);

  /*
   * Load room and project
   */
  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    const loadRoom = async () => {
      try {
        setLoading(true);
        setRoomError("");

        const response = await api.get(
          `/rooms/${roomId}`
        );

        const currentRoom =
          response.data.room;

        setRoom(currentRoom);

        if (
          currentRoom.project?.files
        ) {
          setFiles(
            currentRoom.project.files
          );
        }
      } catch (error) {
        setRoomError(
          getErrorMessage(
            error,
            "Unable to load this room."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [
    roomId,
    navigate,
    setRoom,
    setFiles,
  ]);

  /*
   * Socket.IO room and collaboration events
   */
  useEffect(() => {
    if (
      !socket ||
      !roomId ||
      loading ||
      roomError
    ) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      {
        roomId,
      }
    );

    /*
     * Online users
     */
    const handleRoomUsers = (
      roomUsers = []
    ) => {
      setUsers(roomUsers);
    };

    const handleUserJoined = (
      joinedUser
    ) => {
      if (!joinedUser) {
        return;
      }

      setUsers((currentUsers) => {
        const exists =
          currentUsers.some(
            (item) =>
              String(item.id) ===
              String(
                joinedUser.id
              )
          );

        if (exists) {
          return currentUsers;
        }

        return [
          ...currentUsers,
          joinedUser,
        ];
      });
    };

    const handleUserLeft = (
      leftUser
    ) => {
      if (!leftUser) {
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) =>
            String(item.id) !==
            String(leftUser.id)
        )
      );
    };

    /*
     * Real-time code synchronization
     */
    const handleCodeUpdate = ({
      fileId,
      content,
    }) => {
      if (!fileId) {
        return;
      }

      isRemoteUpdate.current =
        true;

      updateFile({
        id: fileId,
        content,
      });

      setTimeout(() => {
        isRemoteUpdate.current =
          false;
      }, 0);
    };

    /*
     * File created
     */
    const handleFileCreated = ({
      file,
    }) => {
      if (!file) {
        return;
      }

      setFiles((currentFiles) => {
        const newFileId =
          getFileId(file);

        const exists =
          currentFiles.some(
            (currentFile) =>
              getFileId(
                currentFile
              ) === newFileId ||
              currentFile.path ===
                file.path
          );

        if (exists) {
          return currentFiles;
        }

        return [
          ...currentFiles,
          file,
        ];
      });
    };

    /*
     * File deleted
     */
    const handleFileDeleted = ({
      file,
    }) => {
      if (!file) {
        return;
      }

      const deletedFileId =
        getFileId(file);

      setFiles((currentFiles) =>
        currentFiles.filter(
          (currentFile) =>
            getFileId(
              currentFile
            ) !==
            deletedFileId
        )
      );

      /*
       * If the deleted file is currently
       * active, close it.
       */
      if (
        activeFile &&
        getFileId(activeFile) ===
          deletedFileId
      ) {
        closeFile(
          deletedFileId
        );
      }
    };

    /*
     * File renamed
     */
    const handleFileRenamed = ({
      file,
    }) => {
      if (!file) {
        return;
      }

      const renamedFileId =
        getFileId(file);

      setFiles((currentFiles) =>
        currentFiles.map(
          (currentFile) => {
            if (
              getFileId(
                currentFile
              ) !== renamedFileId
            ) {
              return currentFile;
            }

            return {
              ...currentFile,
              id:
                currentFile.id ||
                file.id,
              _id:
                currentFile._id ||
                file.id,
              name: file.name,
              path: file.path,
              language:
                file.language ||
                currentFile.language,
            };
          }
        )
      );
    };

    /*
     * Chat
     */
    const handleChatMessage = (
      message
    ) => {
      if (!message) {
        return;
      }

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          {
            id:
              message.id ||
              `${Date.now()}-${Math.random()}`,
            user:
              message.user || {
                name: "User",
              },
            message:
              message.message || "",
            time:
              message.time ||
              message.createdAt ||
              "",
          },
        ]
      );
    };

    /*
     * Socket errors
     */
    const handleSocketError = (
      error
    ) => {
      if (!error?.message) {
        return;
      }

      console.error(
        "Socket error:",
        error.message
      );
    };

    /*
     * Code execution output
     */
    const handleCodeOutput = (
      result
    ) => {
      setOutput(
        result?.output ||
          result?.message ||
          ""
      );

      setIsRunning(false);
    };

    /*
     * Register listeners
     */
    socket.on(
      SOCKET_EVENTS.ROOM_USERS,
      handleRoomUsers
    );

    socket.on(
      SOCKET_EVENTS.USER_JOINED,
      handleUserJoined
    );

    socket.on(
      SOCKET_EVENTS.USER_LEFT,
      handleUserLeft
    );

    socket.on(
      SOCKET_EVENTS.CODE_UPDATE,
      handleCodeUpdate
    );

    socket.on(
      SOCKET_EVENTS.FILE_CREATED,
      handleFileCreated
    );

    socket.on(
      SOCKET_EVENTS.FILE_DELETED,
      handleFileDeleted
    );

    socket.on(
      SOCKET_EVENTS.FILE_RENAMED,
      handleFileRenamed
    );

    socket.on(
      SOCKET_EVENTS.CHAT_MESSAGE,
      handleChatMessage
    );

    socket.on(
      "socket-error",
      handleSocketError
    );

    socket.on(
      "code-output",
      handleCodeOutput
    );

    /*
     * Cleanup
     */
    return () => {
      socket.emit(
        SOCKET_EVENTS.LEAVE_ROOM,
        {
          roomId,
        }
      );

      socket.off(
        SOCKET_EVENTS.ROOM_USERS,
        handleRoomUsers
      );

      socket.off(
        SOCKET_EVENTS.USER_JOINED,
        handleUserJoined
      );

      socket.off(
        SOCKET_EVENTS.USER_LEFT,
        handleUserLeft
      );

      socket.off(
        SOCKET_EVENTS.CODE_UPDATE,
        handleCodeUpdate
      );

      socket.off(
        SOCKET_EVENTS.FILE_CREATED,
        handleFileCreated
      );

      socket.off(
        SOCKET_EVENTS.FILE_DELETED,
        handleFileDeleted
      );

      socket.off(
        SOCKET_EVENTS.FILE_RENAMED,
        handleFileRenamed
      );

      socket.off(
        SOCKET_EVENTS.CHAT_MESSAGE,
        handleChatMessage
      );

      socket.off(
        "socket-error",
        handleSocketError
      );

      socket.off(
        "code-output",
        handleCodeOutput
      );
    };
  }, [
    socket,
    roomId,
    loading,
    roomError,
    updateFile,
    setFiles,
    setOutput,
    setIsRunning,
    activeFile,
    closeFile,
  ]);

  /*
   * Reset editor when leaving page
   */
  useEffect(() => {
    return () => {
      resetEditor();
    };
  }, [resetEditor]);

  /*
   * Current editor code
   */
  const currentCode = useMemo(
    () =>
      activeFile?.content || "",
    [activeFile]
  );

  /*
   * Code change handler
   */
  const handleFileChange = (
    content
  ) => {
    if (!activeFile) {
      return;
    }

    updateFileContent(content);

    if (
      isRemoteUpdate.current
    ) {
      return;
    }

    if (
      !socket ||
      !connected ||
      !roomId
    ) {
      return;
    }

    const fileId =
      getFileId(activeFile);

    if (!fileId) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.CODE_CHANGE,
      {
        roomId,
        fileId,
        path: activeFile.path,
        content,
        language:
          activeFile.language ||
          language,
      }
    );
  };

  /*
   * Create file
   */
  const handleCreateFile = ({
    name,
    path,
    content = "",
  }) => {
    if (
      !socket ||
      !connected ||
      !roomId
    ) {
      return;
    }

    if (
      !name?.trim() ||
      !path?.trim()
    ) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.FILE_CREATE,
      {
        roomId,
        name: name.trim(),
        path: path.trim(),
        content,
      }
    );
  };

  /*
   * Delete file
   */
  const handleDeleteFile = (
    file
  ) => {
    if (
      !socket ||
      !connected ||
      !roomId ||
      !file
    ) {
      return;
    }

    const fileId =
      getFileId(file);

    if (!fileId) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.FILE_DELETE,
      {
        roomId,
        fileId,
      }
    );
  };

  /*
   * Rename file
   */
  const handleRenameFile = (
    file,
    name,
    path
  ) => {
    if (
      !socket ||
      !connected ||
      !roomId ||
      !file
    ) {
      return;
    }

    const fileId =
      getFileId(file);

    if (
      !fileId ||
      !name?.trim() ||
      !path?.trim()
    ) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.FILE_RENAME,
      {
        roomId,
        fileId,
        name: name.trim(),
        path: path.trim(),
      }
    );
  };

  /*
   * Run code
   */
  const handleRun = () => {
    if (
      !activeFile ||
      !socket ||
      !connected
    ) {
      return;
    }

    setIsRunning(true);
    setOutput("");

    socket.emit("run-code", {
      roomId,
      fileId:
        getFileId(activeFile),
      language:
        activeFile.language ||
        language,
      code: currentCode,
    });
  };

  /*
   * Leave room
   */
  const handleLeave = () => {
    if (
      socket &&
      roomId
    ) {
      socket.emit(
        SOCKET_EVENTS.LEAVE_ROOM,
        {
          roomId,
        }
      );
    }

    resetEditor();
    navigate("/dashboard");
  };

  /*
   * Send chat message
   */
  const handleSendMessage = (
    message
  ) => {
    if (
      !socket ||
      !connected ||
      !roomId ||
      !message?.trim()
    ) {
      return;
    }

    socket.emit(
      SOCKET_EVENTS.CHAT_MESSAGE,
      {
        roomId,
        message:
          message.trim(),
      }
    );
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="full-page-loading">
        <Loading message="Loading room..." />
      </div>
    );
  }

  /*
   * Error state
   */
  if (roomError) {
    return (
      <div className="full-page-loading">
        <div className="empty-state">
          <h3>
            Unable to open room
          </h3>

          <p>
            {roomError}
          </p>

          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  /*
   * Editor
   */
  return (
    <div className="editor-page">
      <RoomHeader
        roomName={
          room?.name ||
          "Collaborative Room"
        }
        roomId={roomId}
        language={language}
        onRun={handleRun}
        onLeave={handleLeave}
      />

      <div className="editor-statusbar">
        <div>
          <span
            className={`connection-dot ${
              connected
                ? "connection-dot--online"
                : ""
            }`}
          />

          {connected
            ? "Connected"
            : "Connecting..."}
        </div>

        <span>
          {users.length}{" "}
          {users.length === 1
            ? "participant"
            : "participants"}
        </span>
      </div>

      <main className="editor-layout">
        <Sidebar
          files={files}
          activeFile={
            activeFile
              ? getFileId(activeFile)
              : null
          }
          onFileSelect={
            selectFile
          }
          onCreateFile={
            handleCreateFile
          }
          onDeleteFile={
            handleDeleteFile
          }
          onRenameFile={
            handleRenameFile
          }
        />

        <section className="editor-main">
          <EditorTabs
            files={openFiles}
            activeFile={
              activeFile
                ? getFileId(
                    activeFile
                  )
                : null
            }
            onSelect={
              selectFile
            }
            onClose={
              closeFile
            }
          />

          <div className="editor-workspace">
            {activeFile ? (
              <CodeEditor
                value={currentCode}
                language={
                  activeFile.language ||
                  language
                }
                onChange={
                  handleFileChange
                }
              />
            ) : (
              <div className="editor-empty">
                <div className="editor-empty__icon">
                  &lt;/&gt;
                </div>

                <h2>
                  Start coding
                </h2>

                <p>
                  Select a file from
                  the explorer to begin
                  editing.
                </p>
              </div>
            )}
          </div>

          <Terminal
            output={output}
            isRunning={
              isRunning
            }
          />
        </section>

        <aside className="editor-right-panel">
          <UserList
            users={users}
          />

          <ChatPanel
            messages={
              messages
            }
            onSendMessage={
              handleSendMessage
            }
          />
        </aside>
      </main>
    </div>
  );
};

export default Editor;
