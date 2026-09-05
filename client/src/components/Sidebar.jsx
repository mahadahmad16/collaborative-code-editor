import FileExplorer from "./FileExplorer";

const Sidebar = ({ files = [], activeFile, onFileSelect }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h3>Explorer</h3>

        <button
          className="sidebar__action"
          type="button"
          aria-label="More options"
        >
          ⋯
        </button>
      </div>

      <FileExplorer
        files={files}
        activeFile={activeFile}
        onFileSelect={onFileSelect}
      />
    </aside>
  );
};

export default Sidebar;