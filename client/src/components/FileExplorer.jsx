import FileItem from "./FileItem";

const getFileId = (file) =>
  String(
    file?.id ||
      file?._id ||
      file?.path ||
      ""
  );

const FileExplorer = ({
  files = [],
  activeFile,
  onFileSelect,
  onDeleteFile,
  onRenameFile,
}) => {
  return (
    <div className="file-explorer">
      <div className="file-explorer__folder">
        <span className="file-explorer__arrow">
          ⌄
        </span>

        <span className="file-explorer__folder-icon">
          ▰
        </span>

        <span>src</span>
      </div>

      <div className="file-explorer__files">
        {files.length > 0 ? (
          files.map((file) => (
            <FileItem
              key={getFileId(file)}
              file={file}
              active={
                getFileId(file) ===
                String(activeFile || "")
              }
              onClick={() =>
                onFileSelect?.(file)
              }
              onDelete={() =>
                onDeleteFile?.(file)
              }
              onRename={(name, path) =>
                onRenameFile?.(
                  file,
                  name,
                  path
                )
              }
            />
          ))
        ) : (
          <p className="file-explorer__empty">
            No files available
          </p>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;