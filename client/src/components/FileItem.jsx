import { useEffect, useRef, useState } from "react";

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

  const [showRename, setShowRename] =
    useState(false);

  const [newName, setNewName] =
    useState(file.name);

  const inputRef = useRef(null);

  useEffect(() => {
    if (showRename) {
      setNewName(file.name);

      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [showRename, file.name]);

  const handleRenameSubmit = (
    event
  ) => {
    event.preventDefault();

    const name = newName.trim();

    if (!name) {
      return;
    }

    if (
      name.includes("/") ||
      name.includes("\\")
    ) {
      return;
    }

    const pathParts =
      file.path.split("/");

    pathParts[
      pathParts.length - 1
    ] = name;

    const newPath =
      pathParts.join("/");

    onRename?.(
      name,
      newPath
    );

    setShowRename(false);
    setShowMenu(false);
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
      {showRename ? (
        <form
          className="file-item__rename-form"
          onSubmit={
            handleRenameSubmit
          }
        >
          <span className="file-item__icon">
            {getFileIcon(
              file.language
            )}
          </span>

          <input
            ref={inputRef}
            className="file-item__rename-input"
            value={newName}
            onChange={(event) =>
              setNewName(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Escape"
              ) {
                setShowRename(false);
              }
            }}
          />
        </form>
      ) : (
        <>
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
            title="File options"
            onClick={(event) => {
              event.stopPropagation();

              setShowMenu(
                (current) =>
                  !current
              );
            }}
          >
            ⋮
          </button>

          {showMenu && (
            <div className="file-item__menu">
              <button
                type="button"
                onClick={() => {
                  setShowRename(true);
                  setShowMenu(false);
                }}
              >
                Rename
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileItem;