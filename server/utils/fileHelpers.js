export const normalizeFileName = (name = "") => {
  return name.trim();
};

export const normalizeFilePath = (path = "") => {
  return path
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
};

export const isValidFileName = (name = "") => {
  const normalizedName = normalizeFileName(name);

  if (!normalizedName) {
    return false;
  }

  if (normalizedName.length > 100) {
    return false;
  }

  return !/[<>:"|?*\x00-\x1F]/.test(
    normalizedName
  );
};

export const getFileLanguage = (
  filename = ""
) => {
  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();

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