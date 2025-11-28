// src/models/room.js
export default (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      room_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      hostel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: "hostels", key: "hostel_id" },
        onDelete: "CASCADE",
      },
      floor: { type: DataTypes.INTEGER, allowNull: false },
      room_number: { type: DataTypes.STRING(20), allowNull: false },
      sharing: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING(20), defaultValue: "available" },
      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    { tableName: "rooms", timestamps: true }
  );

  return Room;
};
