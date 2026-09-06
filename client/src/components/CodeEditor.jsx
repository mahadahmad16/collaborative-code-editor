import Editor from "@monaco-editor/react";

const CodeEditor = ({
  value = "",
  language = "javascript",
  theme = "vs-dark",
  onChange,
}) => {
  return (
    <div className="code-editor">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
            fontSize: 14,
            minimap: {
            enabled: false,
          },
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;