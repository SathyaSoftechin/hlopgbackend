// src/models/otp.js
export default (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      identifier: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM('registration','login','booking','reset_password'),
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "otps",
      timestamps: false,
    }
  );

  return Otp;
};
