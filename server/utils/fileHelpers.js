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

    c: "c",

    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",

    cs: "csharp",

    go: "go",

    rs: "rust",

    php: "php",

    html: "html",
    htm: "html",

    css: "css",

    json: "json",

    md: "markdown",
  };

  return languages[extension] || "plaintext";
};