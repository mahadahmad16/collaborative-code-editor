export const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return `${words[0].charAt(0)}${words[words.length - 1].charAt(
    0
  )}`.toUpperCase();
};

export const getFileExtension = (filename = "") => {
  const parts = filename.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop().toLowerCase();
};

export const getLanguageFromExtension = (filename = "") => {
  const extension = getFileExtension(filename);

  const languages = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    html: "html",
    htm: "html",
    css: "css",
    json: "json",
    md: "markdown",
  };

  return languages[extension] || "plaintext";
};

export const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export const truncateText = (text = "", maxLength = 50) => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const copyToClipboard = async (text) => {
  if (!text) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidRoomId = (roomId = "") => {
  return /^[a-zA-Z0-9-_]{4,50}$/.test(roomId.trim());
};

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};