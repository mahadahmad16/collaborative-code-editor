import { useEditor as useEditorContext } from "../context/EditorContext";

const useEditor = () => {
  return useEditorContext();
};

export default useEditor;