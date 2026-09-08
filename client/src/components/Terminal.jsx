import { useState } from "react";

const Terminal = ({
  output = "",
  isRunning = false,
  stdin = "",
  onStdinChange,
  onClear,
}) => {
  const [activeTab, setActiveTab] =
    useState("output");

  return (
    <section className="terminal">
      <div className="terminal__header">
        <div className="terminal__title">
          <span className="terminal__icon">
            $
          </span>

          <span>Terminal</span>
        </div>

        <div className="terminal__actions">
          <button
            className={`terminal__tab ${
              activeTab === "output"
                ? "terminal__tab--active"
                : ""
            }`}
            type="button"
            onClick={() =>
              setActiveTab("output")
            }
          >
            Output
          </button>

          <button
            className={`terminal__tab ${
              activeTab === "input"
                ? "terminal__tab--active"
                : ""
            }`}
            type="button"
            onClick={() =>
              setActiveTab("input")
            }
          >
            Input
          </button>

          <button
            className="terminal__clear"
            type="button"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="terminal__body">
        {activeTab === "input" ? (
          <div className="terminal__input-wrapper">
            <label
              className="terminal__input-label"
              htmlFor="terminal-input"
            >
              Standard Input
            </label>

            <textarea
              id="terminal-input"
              className="terminal__input"
              value={stdin}
              onChange={(event) =>
                onStdinChange?.(
                  event.target.value
                )
              }
              placeholder={
                "Enter program input here...\nExample:\n10\n20"
              }
              spellCheck={false}
            />

            <p className="terminal__input-hint">
              Each line is passed to the
              program as standard input.
            </p>
          </div>
        ) : isRunning ? (
          <div className="terminal__message">
            Executing code...
          </div>
        ) : output ? (
          <pre className="terminal__output">
            {output}
          </pre>
        ) : (
          <div className="terminal__message">
            Run your code to see the output
            here.
          </div>
        )}
      </div>
    </section>
  );
};

export default Terminal;