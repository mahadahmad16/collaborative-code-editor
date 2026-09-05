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
        theme={theme}
        value={value}
        onChange={(value) => onChange?.(value ?? "")}
        options={{
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          padding: {
            top: 16,
            bottom: 16,
          },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
        }}
      />
    </div>
  );
};

export default CodeEditor;