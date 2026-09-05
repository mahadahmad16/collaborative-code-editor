const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <span>{message}</span>
    </div>
  );
};

export default Loading;