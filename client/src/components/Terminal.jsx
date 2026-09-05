const Terminal = ({ output = "", isRunning = false }) => {
  return (
    <section className="terminal">
      <div className="terminal__header">
        <div className="terminal__tabs">
          <span className="terminal__tab terminal__tab--active">
            Terminal
          </span>
          <span className="terminal__tab">Output</span>
        </div>

        <button className="terminal__clear" type="button">
          Clear
        </button>
      </div>

      <div className="terminal__body">
        {isRunning ? (
          <span className="terminal__status">Running...</span>
        ) : output ? (
          <pre>{output}</pre>
        ) : (
          <span className="terminal__placeholder">
            Run your code to see the output here.
          </span>
        )}
      </div>
    </section>
  );
};

export default Terminal;