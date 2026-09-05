export const APP_NAME = "CodeSync";

export const STORAGE_KEYS = {
  TOKEN: "codeSync_token",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CREATE_ROOM: "/create-room",
  JOIN_ROOM: "/join-room",
  EDITOR: "/editor",
};

export const LANGUAGES = {
  JAVASCRIPT: "javascript",
  TYPESCRIPT: "typescript",
  PYTHON: "python",
  JAVA: "java",
  HTML: "html",
  CSS: "css",
  JSON: "json",
  MARKDOWN: "markdown",
};

export const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  markdown: "Markdown",
};

export const DEFAULT_LANGUAGE = LANGUAGES.JAVASCRIPT;

export const SOCKET_EVENTS = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  ROOM_USERS: "room-users",
  CODE_CHANGE: "code-change",
  CODE_UPDATE: "code-update",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  CURSOR_MOVE: "cursor-move",
  CHAT_MESSAGE: "chat-message",
  USER_TYPING: "user-typing",
};

export const EDITOR_CONFIG = {
  FONT_SIZE: 14,
  MINIMAP: false,
  WORD_WRAP: "on",
};