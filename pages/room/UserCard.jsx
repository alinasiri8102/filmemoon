const UserCard = (props) => {
  const { user } = props;
  return (
    <div className="member-card flex-h">
      <img src={user?.imageUrl} />
      <div className="user-detail">
        <p className="name">{user?.fullName}</p>
        <small className="email">{user?.nickName || "cool nickname"}</small>
      </div>
    </div>
  );
};

export default UserCard;
