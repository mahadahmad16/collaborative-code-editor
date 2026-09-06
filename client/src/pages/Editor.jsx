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

  const isRemoteUpdate = useRef(false);

  useEffect(() => {
  if (!roomId) {
    navigate("/dashboard", { replace: true });
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

      if (currentRoom.project?.files?.length) {
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
}, [roomId, navigate, setRoom, setFiles]);
  useEffect(() => {
    if (!socket || !roomId || loading || roomError) {
      return;
    }

    const currentUser = {
      id: user?.id || user?._id,
      name: user?.name || "User",
    };

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      user: currentUser,
    });

    const handleRoomUsers = (roomUsers = []) => {
      setUsers(roomUsers);
    };

    const handleUserJoined = (joinedUser) => {
      if (!joinedUser) return;

      setUsers((currentUsers) => {
        const exists = currentUsers.some(
          (item) =>
            String(item.id) === String(joinedUser.id)
        );

        return exists
          ? currentUsers
          : [...currentUsers, joinedUser];
      });
    };

    const handleUserLeft = (leftUser) => {
      if (!leftUser) return;

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) =>
            String(item.id) !== String(leftUser.id)
        )
      );
    };

    const handleCodeUpdate = (updatedFile) => {
      if (!updatedFile) return;

      isRemoteUpdate.current = true;
      updateFile(updatedFile);

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 0);
    };

    const handleChatMessage = (message) => {
      if (!message) return;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id:
            message.id ||
            `${Date.now()}-${Math.random()}`,
          user: message.user || {
            name: "User",
          },
          message: message.message || "",
          time: message.time || "",
        },
      ]);
    };

    const handleCodeOutput = (result) => {
      setOutput(result?.output || result?.message || "");
      setIsRunning(false);
    };

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
      SOCKET_EVENTS.CHAT_MESSAGE,
      handleChatMessage
    );

    socket.on("code-output", handleCodeOutput);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
        roomId,
      });

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
        SOCKET_EVENTS.CHAT_MESSAGE,
        handleChatMessage
      );

      socket.off("code-output", handleCodeOutput);
    };
  }, [
    socket,
    roomId,
    user,
    loading,
    roomError,
    updateFile,
    setOutput,
    setIsRunning,
  ]);

  useEffect(() => {
    return () => {
      resetEditor();
    };
  }, [resetEditor]);

  const currentCode = useMemo(
    () => activeFile?.content || "",
    [activeFile]
  );

  const handleFileChange = (content) => {
    updateFileContent(content);

    if (
      !socket ||
      !roomId ||
      !activeFile ||
      isRemoteUpdate.current
    ) {
      return;
    }

    socket.emit(SOCKET_EVENTS.CODE_CHANGE, {
      roomId,
      fileId: activeFile.id,
      path: activeFile.path,
      content,
      language: activeFile.language || language,
    });
  };

  const handleRun = () => {
    if (!activeFile || !socket) {
      return;
    }

    setIsRunning(true);
    setOutput("");

    socket.emit("run-code", {
      roomId,
      fileId: activeFile.id,
      language,
      code: currentCode,
    });
  };

  const handleLeave = () => {
    if (socket && roomId) {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
        roomId,
      });
    }

    resetEditor();
    navigate("/dashboard");
  };

  const handleSendMessage = (message) => {
    if (!socket || !roomId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      roomId,
      message,
    });
  };

  if (loading) {
    return (
      <div className="full-page-loading">
        <Loading message="Loading room..." />
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="full-page-loading">
        <div className="empty-state">
          <h3>Unable to open room</h3>
          <p>{roomError}</p>

          <button
            className="button button--primary"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <RoomHeader
        roomName={room?.name || "Collaborative Room"}
        roomId={roomId}
        language={language}
        onRun={handleRun}
        onLeave={handleLeave}
      />

      <div className="editor-statusbar">
        <div>
          <span
            className={`connection-dot ${
              connected ? "connection-dot--online" : ""
            }`}
          />

          {connected ? "Connected" : "Connecting..."}
        </div>

        <span>
          {users.length}{" "}
          {users.length === 1 ? "participant" : "participants"}
        </span>
      </div>

      <main className="editor-layout">
        <Sidebar
          files={files}
          activeFile={
            activeFile?.id || activeFile?.path
          }
          onFileSelect={selectFile}
        />

        <section className="editor-main">
          <EditorTabs
            files={openFiles}
            activeFile={
              activeFile?.id || activeFile?.path
            }
            onSelect={selectFile}
            onClose={closeFile}
          />

          <div className="editor-workspace">
            {activeFile ? (
              <CodeEditor
                value={currentCode}
                language={language}
                onChange={handleFileChange}
              />
            ) : (
              <div className="editor-empty">
                <div className="editor-empty__icon">
                  &lt;/&gt;
                </div>

                <h2>Start coding</h2>

                <p>
                  Select a file from the explorer to begin editing.
                </p>
              </div>
            )}
          </div>

          <Terminal
            output={output}
            isRunning={isRunning}
          />
        </section>

        <aside className="editor-right-panel">
          <UserList users={users} />

          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </aside>
      </main>
    </div>
  );
};

export default Editor;