const RoomHeader = ({
  roomName,
  roomId,
  language,
  onRun,
  onLeave,
  onDelete,
  isOwner,
}) => {
  const copyRoomId = async () => {
    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(
        roomId
      );
    } catch {
      // Clipboard access may be unavailable.
    }
  };

  return (
    <header className="room-header">
      <div className="room-header__info">
        <div className="room-header__title">
          <span className="room-header__indicator" />

          <h2>{roomName}</h2>
        </div>

        {roomId && (
          <button
            className="room-header__room-id"
            type="button"
            onClick={copyRoomId}
            title="Copy room ID"
          >
            Room: {roomId}
          </button>
        )}
      </div>

      <div className="room-header__actions">
        <span className="room-header__language">
          {language}
        </span>

        <button
          className="button button--primary"
          type="button"
          onClick={onRun}
        >
          Run
        </button>

        <button
          className="button button--danger"
          type="button"
          onClick={onLeave}
        >
          Leave
        </button>

        {isOwner && (
          <button
            className="delete-room-btn"
            type="button"
            onClick={onDelete}
          >
            Delete Room
          </button>
        )}
      </div>
    </header>
  );
};

export default RoomHeader;