export default (sequelize, DataTypes) => {
  const HostelRoom = sequelize.define(
    "HostelRoom",
    {
      hostel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      layout: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { floors: [] },
      },
    },
    {
      tableName: "hostel_rooms",
      timestamps: false,   // ✅ THIS FIXES YOUR ERROR
    }
  );

  return HostelRoom;
};
