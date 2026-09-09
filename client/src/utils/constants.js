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
  C: "c",
  CPP: "cpp",
  CSHARP: "csharp",
  GO: "go",
  RUST: "rust",
  PHP: "php",
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
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
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

  INITIAL_STATE: "initial-state",

  CODE_CHANGE: "code-change",
  CODE_UPDATE: "code-update",

  FILE_CREATE: "file-create",
  FILE_CREATED: "file-created",

  FILE_DELETE: "file-delete",
  FILE_DELETED: "file-deleted",

  FILE_RENAME: "file-rename",
  FILE_RENAMED: "file-renamed",

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

export const CURSOR_COLORS = [
  "#FF6B6B",
  "#4D96FF",
  "#6BCB77",
  "#FFD93D",
  "#C77DFF",
  "#FF922B",
  "#20C997",
  "#F06595",
];