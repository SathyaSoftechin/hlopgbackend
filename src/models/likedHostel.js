export default (sequelize, DataTypes) => {
  const LikedHostel = sequelize.define("LikedHostel", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    hostel_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  });

  return LikedHostel;
};
