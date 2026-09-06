import { useState } from "react";

import FileExplorer from "./FileExplorer";
import NewFileModal from "./NewFileModal";

const Sidebar = ({
  files = [],
  activeFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [showNewFileModal, setShowNewFileModal] =
    useState(false);

  const handleCreateFile = (name) => {
    const path = `src/${name}`;

    onCreateFile?.({
      name,
      path,
      content: "",
    });
  };

  return (
    <>
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
                setShowNewFileModal(true)
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

      <NewFileModal
        isOpen={showNewFileModal}
        onClose={() =>
          setShowNewFileModal(false)
        }
        onCreate={handleCreateFile}
      />
    </>
  );
};

export default Sidebar;