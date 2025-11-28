// src/models/visitor.js
export default (sequelize, DataTypes) => {
  const Visitor = sequelize.define(
    "Visitor",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { 
        type: DataTypes.STRING(255), 
        allowNull: false, 
        unique: true, 
        defaultValue: "Not Provided", 
        validate: { isEmail: true } 
      },
      phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
    gender: { type: DataTypes.STRING(10),   
allowNull: true 
},      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      user_type: { type: DataTypes.STRING(50), defaultValue: "user" },
      aadhar_no: { type: DataTypes.BIGINT, unique: true, allowNull: true },
    },
    {
      tableName: "visitors",
      timestamps: false,
    }
  );

  return Visitor;
};
