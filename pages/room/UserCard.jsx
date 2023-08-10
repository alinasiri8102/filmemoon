const UserCard = (props) => {
  const { user } = props;
  return (
    <div className="member-card flex-h">
      <img src={user?.picture} />
      <div className="user-detail">
        <p className="name">{user?.name}</p>
        <small className="email">{user?.email}</small>
      </div>
    </div>
  );
};

export default UserCard;
