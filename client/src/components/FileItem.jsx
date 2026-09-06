import { useState } from "react";

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

  return (
    icons[language?.toLowerCase()] ||
    "•"
  );
};

const FileItem = ({
  file,
  active = false,
  onClick,
  onDelete,
  onRename,
}) => {
  const [showMenu, setShowMenu] =
    useState(false);

  const handleRename = () => {
    setShowMenu(false);

    const newName = window.prompt(
      "Enter new file name:",
      file.name
    );

    if (!newName?.trim()) {
      return;
    }

    const pathParts =
      file.path.split("/");

    pathParts[
      pathParts.length - 1
    ] = newName.trim();

    const newPath =
      pathParts.join("/");

    onRename?.(
      newName.trim(),
      newPath
    );
  };

  const handleDelete = () => {
    setShowMenu(false);

    const confirmed =
      window.confirm(
        `Delete "${file.name}"?`
      );

    if (!confirmed) {
      return;
    }

    onDelete?.();
  };

  return (
    <div
      className={`file-item-wrapper ${
        active
          ? "file-item-wrapper--active"
          : ""
      }`}
    >
      <button
        className={`file-item ${
          active
            ? "file-item--active"
            : ""
        }`}
        type="button"
        onClick={onClick}
      >
        <span className="file-item__icon">
          {getFileIcon(
            file.language
          )}
        </span>

        <span className="file-item__name">
          {file.name}
        </span>
      </button>

      <button
        className="file-item__menu-button"
        type="button"
        aria-label={`Options for ${file.name}`}
        onClick={(event) => {
          event.stopPropagation();

          setShowMenu(
            (current) => !current
          );
        }}
      >
        ⋯
      </button>

      {showMenu && (
        <div className="file-item__menu">
          <button
            type="button"
            onClick={handleRename}
          >
            Rename
          </button>

          <button
            type="button"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FileItem;