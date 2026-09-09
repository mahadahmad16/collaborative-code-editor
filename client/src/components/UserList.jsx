const UserList = ({ users = [] }) => {
  return (
    <section className="user-list">
      <div className="user-list__header">
        <h3>Participants</h3>

        <span className="user-list__count">
          {users.length}
        </span>
      </div>

      <div className="user-list__items">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              className="user-list__user"
              key={user.id}
            >
              <div className="user-list__avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div className="user-list__info">
                <span className="user-list__name">
                  {user.name || "Anonymous"}
                </span>

                <span className="user-list__status user-list__status--online">
                  <span className="user-list__status-dot"></span>
                  Online
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="user-list__empty">
            No participants
          </p>
        )}
      </div>
    </section>
  );
};

export default UserList;