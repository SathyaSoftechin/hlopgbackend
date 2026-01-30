export default (sequelize, DataTypes) => {
  const PgUpdate = sequelize.define(
    "PgUpdate",
    {
      update_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      hostel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      owner_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "pg_updates",
      timestamps: false,
    }
  );

  return PgUpdate;
};
