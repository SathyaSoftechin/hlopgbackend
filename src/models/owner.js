// src/models/owner.js
export default (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    owner_id: { 
      type: DataTypes.BIGINT, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    phone: { 
      type: DataTypes.STRING(20), 
      allowNull: false, 
      unique: true 
    },
    email: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      unique: true, 
      defaultValue: 'Not Provided' 
    },
    password: { 
      type: DataTypes.STRING(255), 
      allowNull: false 
    },
    is_verified: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    user_type: { 
      type: DataTypes.STRING(50), 
      defaultValue: 'owner' 
    },
    aadhar_no: { 
      type: DataTypes.BIGINT, 
      unique: true, 
      allowNull: true 
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    }
  }, {
    tableName: 'owners',
    timestamps: false,
  });

  return Owner;
};
