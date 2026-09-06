import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { DEFAULT_LANGUAGE } from "../utils/constants";

const EditorContext = createContext(null);

const getFileId = (file) =>
  String(file?.id || file?._id || file?.path || "");

const isSameFile = (firstFile, secondFile) => {
  if (!firstFile || !secondFile) {
    return false;
  }

  return (
    getFileId(firstFile) ===
    getFileId(secondFile)
  );
};

export const EditorProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [project, setProject] = useState(null);

  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  const [language, setLanguage] =
    useState(DEFAULT_LANGUAGE);

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] =
    useState(false);

  const selectFile = useCallback((file) => {
    if (!file) {
      return;
    }

    const selectedFile = {
      ...file,
    };

    setActiveFile(selectedFile);

    setLanguage(
      selectedFile.language ||
        DEFAULT_LANGUAGE
    );

    setOpenFiles((currentFiles) => {
      const alreadyOpen =
        currentFiles.some((openFile) =>
          isSameFile(
            openFile,
            selectedFile
          )
        );

      if (alreadyOpen) {
        return currentFiles;
      }

      return [
        ...currentFiles,
        selectedFile,
      ];
    });
  }, []);

  const closeFile = useCallback(
    (file) => {
      if (!file) {
        return;
      }

      setOpenFiles((currentFiles) => {
        const index =
          currentFiles.findIndex(
            (openFile) =>
              isSameFile(
                openFile,
                file
              )
          );

        const updatedFiles =
          currentFiles.filter(
            (openFile) =>
              !isSameFile(
                openFile,
                file
              )
          );

        setActiveFile((currentActive) => {
          if (
            !currentActive ||
            !isSameFile(
              currentActive,
              file
            )
          ) {
            return currentActive;
          }

          const nextFile =
            updatedFiles[index] ||
            updatedFiles[index - 1] ||
            null;

          if (nextFile) {
            setLanguage(
              nextFile.language ||
                DEFAULT_LANGUAGE
            );
          } else {
            setLanguage(
              DEFAULT_LANGUAGE
            );
          }

          return nextFile;
        });

        return updatedFiles;
      });
    },
    []
  );

  const updateFileContent =
    useCallback(
      (content) => {
        if (!activeFile) {
          return;
        }

        setFiles((currentFiles) =>
          currentFiles.map((file) =>
            isSameFile(
              file,
              activeFile
            )
              ? {
                  ...file,
                  content,
                }
              : file
          )
        );

        setActiveFile(
          (currentFile) =>
            currentFile
              ? {
                  ...currentFile,
                  content,
                }
              : currentFile
        );

        setOpenFiles(
          (currentFiles) =>
            currentFiles.map(
              (file) =>
                isSameFile(
                  file,
                  activeFile
                )
                  ? {
                      ...file,
                      content,
                    }
                  : file
            )
        );
      },
      [activeFile]
    );

  const updateFile = useCallback(
    (updatedFile) => {
      if (!updatedFile) {
        return;
      }

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          isSameFile(
            file,
            updatedFile
          )
            ? {
                ...file,
                ...updatedFile,
              }
            : file
        )
      );

      setOpenFiles(
        (currentFiles) =>
          currentFiles.map((file) =>
            isSameFile(
              file,
              updatedFile
            )
              ? {
                  ...file,
                  ...updatedFile,
                }
              : file
          )
      );

      setActiveFile(
        (currentFile) =>
          currentFile &&
          isSameFile(
            currentFile,
            updatedFile
          )
            ? {
                ...currentFile,
                ...updatedFile,
              }
            : currentFile
      );

      if (updatedFile.language) {
        setLanguage(
          updatedFile.language
        );
      }
    },
    []
  );

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
  const context =
    useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used inside an EditorProvider"
    );
  }

  return context;
};