const EditorTabs = ({ files = [], activeFile, onSelect, onClose }) => {
  return (
    <div className="editor-tabs">
      {files.map((file) => {
        const isActive =
          activeFile === file.id || activeFile === file.path;

        return (
          <div
            key={file.id || file.path || file.name}
            className={`editor-tab ${
              isActive ? "editor-tab--active" : ""
            }`}
          >
            <button
              className="editor-tab__content"
              type="button"
              onClick={() => onSelect?.(file)}
            >
              <span>{file.name}</span>
            </button>

            <button
              className="editor-tab__close"
              type="button"
              aria-label={`Close ${file.name}`}
              onClick={() => onClose?.(file)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;