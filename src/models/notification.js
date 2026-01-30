export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      notification_id: {
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

      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notifications",
      timestamps: false,
    }
  );

  return Notification;
};
