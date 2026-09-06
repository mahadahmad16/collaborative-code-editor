import FileExplorer from "./FileExplorer";

const Sidebar = ({
  files = [],
  activeFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h3>Explorer</h3>

        <div className="sidebar__actions">
          <button
            className="sidebar__action"
            type="button"
            aria-label="Create new file"
            title="New File"
            onClick={() =>
              onCreateFile?.()
            }
          >
            +
          </button>

          <button
            className="sidebar__action"
            type="button"
            aria-label="More options"
            title="More options"
          >
            ⋯
          </button>
        </div>
      </div>

      <FileExplorer
        files={files}
        activeFile={activeFile}
        onFileSelect={onFileSelect}
        onDeleteFile={onDeleteFile}
        onRenameFile={onRenameFile}
      />
    </aside>
  );
};

export default Sidebar;