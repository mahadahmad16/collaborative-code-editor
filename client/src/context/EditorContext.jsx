import { createContext, useContext, useMemo, useState } from "react";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const selectFile = (file) => {
    setActiveFile(file);

    const alreadyOpen = openFiles.some(
      (openFile) =>
        openFile.id === file.id || openFile.path === file.path
    );

    if (!alreadyOpen) {
      setOpenFiles((currentFiles) => [...currentFiles, file]);
    }

    if (file.language) {
      setLanguage(file.language);
    }
  };

  const closeFile = (file) => {
    setOpenFiles((currentFiles) =>
      currentFiles.filter(
        (openFile) =>
          openFile.id !== file.id && openFile.path !== file.path
      )
    );

    if (
      activeFile?.id === file.id ||
      activeFile?.path === file.path
    ) {
      setActiveFile(null);
    }
  };

  const updateFileContent = (content) => {
    if (!activeFile) return;

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFile.id || file.path === activeFile.path
          ? { ...file, content }
          : file
      )
    );

    setActiveFile((currentFile) =>
      currentFile ? { ...currentFile, content } : currentFile
    );

    setOpenFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFile.id || file.path === activeFile.path
          ? { ...file, content }
          : file
      )
    );
  };

  const resetEditor = () => {
    setRoom(null);
    setProject(null);
    setFiles([]);
    setOpenFiles([]);
    setActiveFile(null);
    setLanguage("javascript");
    setOutput("");
    setIsRunning(false);
  };

  const value = useMemo(
    () => ({
      room,
      setRoom,
      project,
      setProject,
      files,
      setFiles,
      openFiles,
      activeFile,
      language,
      output,
      isRunning,
      setLanguage,
      setOutput,
      setIsRunning,
      selectFile,
      closeFile,
      updateFileContent,
      resetEditor,
    }),
    [
      room,
      project,
      files,
      openFiles,
      activeFile,
      language,
      output,
      isRunning,
    ]
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor must be used inside an EditorProvider");
  }

  return context;
};