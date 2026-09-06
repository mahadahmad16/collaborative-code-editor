import { useEffect, useRef, useState } from "react";

const NewFileModal = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [fileName, setFileName] =
    useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFileName("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = fileName.trim();

    if (!name) {
      return;
    }

    if (
      name.includes("/") ||
      name.includes("\\")
    ) {
      return;
    }

    onCreate(name);

    setFileName("");
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-file-title"
      >
        <div className="modal__header">
          <div>
            <span className="eyebrow">
              Explorer
            </span>

            <h3 id="new-file-title">
              New File
            </h3>
          </div>

          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <label
              className="form-label"
              htmlFor="new-file-name"
            >
              File name
            </label>

            <input
              ref={inputRef}
              id="new-file-name"
              className="form-input"
              type="text"
              placeholder="e.g. calculator.js"
              value={fileName}
              onChange={(event) =>
                setFileName(
                  event.target.value
                )
              }
              autoComplete="off"
            />

            <p className="modal__hint">
              The file will be created inside
              the <strong>src</strong> folder.
            </p>
          </div>

          <div className="modal__footer">
            <button
              className="button button--secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="button button--primary"
              type="submit"
              disabled={!fileName.trim()}
            >
              Create file
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFileModal;