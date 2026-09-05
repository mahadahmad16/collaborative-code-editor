import FileItem from "./FileItem";

const FileExplorer = ({ files = [], activeFile, onFileSelect }) => {
  return (
    <div className="file-explorer">
      <div className="file-explorer__folder">
        <span className="file-explorer__arrow">⌄</span>
        <span className="file-explorer__folder-icon">▰</span>
        <span>src</span>
      </div>

      <div className="file-explorer__files">
        {files.length > 0 ? (
          files.map((file) => (
            <FileItem
              key={file.id || file.path || file.name}
              file={file}
              active={activeFile === file.id || activeFile === file.path}
              onClick={() => onFileSelect?.(file)}
            />
          ))
        ) : (
          <p className="file-explorer__empty">No files available</p>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;