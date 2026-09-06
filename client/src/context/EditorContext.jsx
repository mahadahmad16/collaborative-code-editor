import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANGUAGE } from "../utils/constants";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const getFileId = (file) => file?.id || file?._id || file?.path;

  const isSameFile = (firstFile, secondFile) => getFileId(firstFile) === getFileId(secondFile);

  const selectFile = useCallback((file) => {
  if (!file) return;

  setActiveFile(file);

  setOpenFiles((currentFiles) => {
    const alreadyOpen = currentFiles.some(
      (openFile) => isSameFile(openFile, file)
    );

    return alreadyOpen
      ? currentFiles
      : [...currentFiles, file];
  });

  if (file.language) {
    setLanguage(file.language);
  }
}, []);

  const closeFile = useCallback((file) => {
    if (!file) return;

    setOpenFiles((currentFiles) => {
      const index = currentFiles.findIndex(
        (openFile) =>
          openFile.id === file.id || openFile.path === file.path
      );

      const updatedFiles = currentFiles.filter(
        (openFile) =>
          openFile.id !== file.id && openFile.path !== file.path
      );

      const isActive =
        activeFile?.id === file.id ||
        activeFile?.path === file.path;

      if (isActive) {
        const nextFile =
          updatedFiles[index] ||
          updatedFiles[index - 1] ||
          null;

        setActiveFile(nextFile);

        if (nextFile?.language) {
          setLanguage(nextFile.language);
        }
      }

      return updatedFiles;
    });
  }, [activeFile]);

  const updateFileContent = useCallback(
    (content) => {
      if (!activeFile) return;

      const isSameFile = (file) =>
        file.id === activeFile.id ||
        file.path === activeFile.path;

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          isSameFile(file)
            ? { ...file, content }
            : file
        )
      );

      setActiveFile((currentFile) =>
        currentFile
          ? { ...currentFile, content }
          : currentFile
      );

      setOpenFiles((currentFiles) =>
        currentFiles.map((file) =>
          isSameFile(file)
            ? { ...file, content }
            : file
        )
      );
    },
    [activeFile]
  );

  const updateFile = useCallback((updatedFile) => {
  if (!updatedFile) return;

  setFiles((currentFiles) =>
    currentFiles.map((file) =>
      isSameFile(file, updatedFile)
        ? { ...file, ...updatedFile }
        : file
    )
  );

  setOpenFiles((currentFiles) =>
    currentFiles.map((file) =>
      isSameFile(file, updatedFile)
        ? { ...file, ...updatedFile }
        : file
    )
  );

  setActiveFile((currentFile) =>
    currentFile && isSameFile(currentFile, updatedFile)
      ? { ...currentFile, ...updatedFile }
      : currentFile
  );

  if (updatedFile.language) {
    setLanguage(updatedFile.language);
  }
}, []);

  const resetEditor = useCallback(() => {
    setRoom(null);
    setProject(null);
    setFiles([]);
    setOpenFiles([]);
    setActiveFile(null);
    setLanguage(DEFAULT_LANGUAGE);
    setOutput("");
    setIsRunning(false);
  }, []);

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
      setLanguage,

      output,
      setOutput,

      isRunning,
      setIsRunning,

      selectFile,
      closeFile,
      updateFileContent,
      updateFile,
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
      selectFile,
      closeFile,
      updateFileContent,
      updateFile,
      resetEditor,
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