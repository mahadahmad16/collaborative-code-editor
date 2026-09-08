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

  const { token, user } = useAuth();

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

  const { socket, connected } = useSocket(token);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState("");

  const [stdin, setStdin] = useState("");

  const activeFileRef = useRef(activeFile);
  const userRef = useRef(user);
  const closeFileRef = useRef(closeFile);
  const updateFileRef = useRef(updateFile);
  const selectFileRef = useRef(selectFile);
  const setFilesRef = useRef(setFiles);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    closeFileRef.current = closeFile;
  }, [closeFile]);

  useEffect(() => {
    updateFileRef.current = updateFile;
  }, [updateFile]);

  useEffect(() => {
    selectFileRef.current = selectFile;
  }, [selectFile]);

  useEffect(() => {
    setFilesRef.current = setFiles;
  }, [setFiles]);

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

        const currentRoom = response.data.room;

        setRoom(currentRoom);

        if (currentRoom.project?.files) {
          setFiles(currentRoom.project.files);
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
   * Socket.IO room lifecycle
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

    return () => {
      socket.emit(
        SOCKET_EVENTS.LEAVE_ROOM,
        {
          roomId,
        }
      );
    };
  }, [
    socket,
    roomId,
    loading,
    roomError,
  ]);

  /*
   * Socket.IO collaboration listeners
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

    const handleInitialState = ({
  files: initialFiles = [],
}) => {
  if (!Array.isArray(initialFiles)) {
    return;
  }

  const currentActiveFile =
    activeFileRef.current;

  setFilesRef.current(
    initialFiles
  );

  if (!currentActiveFile) {
    const firstFile =
      initialFiles[0];

    if (firstFile) {
      selectFileRef.current(
        firstFile
      );
    }

    return;
  }

  const matchingFile =
    initialFiles.find(
      (file) =>
        String(
          getFileId(file)
        ) ===
        String(
          getFileId(
            currentActiveFile
          )
        )
    );

  if (matchingFile) {
    updateFileRef.current(
      matchingFile
    );
  }
};

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
        const exists = currentUsers.some(
          (item) =>
            String(item.id) ===
            String(joinedUser.id)
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

  updateFileRef.current({
    id: fileId,
    content,
  });
};

    /*
     * File created
     */
    const handleFileCreated = ({
      file,
      userId,
    }) => {
      if (!file) {
        return;
      }

      setFilesRef.current((currentFiles) => {
        const newFileId = String(
          getFileId(file)
        );

        const exists = currentFiles.some(
          (currentFile) =>
            String(
              getFileId(currentFile)
            ) === newFileId ||
            currentFile.path === file.path
        );

        if (exists) {
          return currentFiles;
        }

        return [
          ...currentFiles,
          file,
        ];
      });

      if (
        String(userId) ===
        String(
          userRef.current?.id ||
            userRef.current?._id
        )
      ) {
        selectFileRef.current(file);
      }
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

      const deletedFileId = String(
        getFileId(file)
      );

      setFilesRef.current(
        (currentFiles) =>
          currentFiles.filter(
            (currentFile) =>
              String(
                getFileId(currentFile)
              ) !== deletedFileId
          )
      );

      const currentActiveFile =
        activeFileRef.current;

      if (
        currentActiveFile &&
        String(
          getFileId(currentActiveFile)
        ) === deletedFileId
      ) {
        closeFileRef.current(file);
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

      updateFileRef.current({
        id: file.id || file._id,
        name: file.name,
        path: file.path,
        language: file.language,
      });
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
    const handleCodeOutput = (result) => {
  if (!result) {
    setOutput(
      "No execution result received."
    );

    setIsRunning(false);

    return;
  }

  let finalOutput =
    result.output ||
    result.message ||
    "Program finished without output.";

  if (
    result.time !== null &&
    result.time !== undefined
  ) {
    finalOutput += `\n\nExecution time: ${result.time}s`;
  }

  if (
    result.memory !== null &&
    result.memory !== undefined
  ) {
    finalOutput += `\nMemory: ${result.memory} KB`;
  }

  setOutput(finalOutput);

  setIsRunning(false);
};
    /*
     * Register listeners
     */

    socket.on(
      SOCKET_EVENTS.INITIAL_STATE,
      handleInitialState
    );

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
     * Remove listeners
     */
    return () => {

      socket.off(
        SOCKET_EVENTS.INITIAL_STATE,
        handleInitialState
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
    setOutput,
    setIsRunning,
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
    () => activeFile?.content || "",
    [activeFile]
  );

  /*
   * Code change handler
   */
  const handleFileChange = (content) => {
  if (!activeFile) {
    return;
  }

  updateFileContent(content);

  if (
    !socket ||
    !connected ||
    !roomId
  ) {
    return;
  }

  const fileId = getFileId(activeFile);

  if (!fileId) {
    return;
  }

  socket.emit(
    SOCKET_EVENTS.CODE_CHANGE,
    {
      roomId,
      fileId,
      content,
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
  if (!activeFile) {
    setOutput(
      "Select a file before running the code."
    );

    return;
  }

  if (!socket || !connected) {
    setOutput(
      "Not connected to the server."
    );

    return;
  }

  const fileId =
    getFileId(activeFile);

  if (!fileId) {
    setOutput(
      "Unable to identify the selected file."
    );

    return;
  }

  const selectedLanguage =
    activeFile.language ||
    language;

  const supportedLanguages = [
    "javascript",
    "java",
  ];

  if (
    !supportedLanguages.includes(
      selectedLanguage
    )
  ) {
    setOutput(
      `Code execution for ${selectedLanguage} is not available yet.`
    );

    return;
  }

  setIsRunning(true);
  setOutput("Running code...");

  socket.emit(
    "run-code",
    {
      roomId,
      fileId,
      language:
        selectedLanguage,
      code: currentCode,
      stdin,
    }
  );
};

  /*
   * Leave room
   */
  const handleLeave = () => {
    if (socket && roomId) {
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
        message: message.trim(),
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

          <p>{roomError}</p>

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
          onFileSelect={selectFile}
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
                ? getFileId(activeFile)
                : null
            }
            onSelect={selectFile}
            onClose={closeFile}
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
            isRunning={isRunning}
            stdin={stdin}
            onStdinChange={setStdin}
            onClear={() => setOutput("")}
          />
        </section>

        <aside className="editor-right-panel">
          <UserList users={users} />

          <ChatPanel
            messages={messages}
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