const getFileIcon = (language) => {
  const icons = {
    javascript: "JS",
    javascriptreact: "JSX",
    typescript: "TS",
    typescriptreact: "TSX",
    python: "PY",
    java: "JA",
    html: "HTML",
    css: "CSS",
    json: "{}",
    markdown: "MD",
  };

  return icons[language?.toLowerCase()] || "•";
};

const FileItem = ({ file, active = false, onClick }) => {
  return (
    <button
      className={`file-item ${active ? "file-item--active" : ""}`}
      type="button"
      onClick={onClick}
    >
      <span className="file-item__icon">
        {getFileIcon(file.language)}
      </span>

      <span className="file-item__name">{file.name}</span>
    </button>
  );
};

export default FileItem;