export default (sequelize, DataTypes) => {
  const Hostel = sequelize.define('Hostel', {
    hostel_id: { 
      type: DataTypes.BIGINT, 
      primaryKey: true, 
      autoIncrement: true 
    },
    hostel_name: { 
      type: DataTypes.STRING(150), 
      allowNull: false 
    },
    city: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    area: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    address: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    rating: { 
      type: DataTypes.DECIMAL(2,1), 
      defaultValue: 0.0 
    },
    amenities: { 
      type: DataTypes.JSONB, 
      defaultValue: {} 
    },

    // ⭐ NEW FIELD ADDED HERE
    rules: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [
        "No Smoking",
        "No Alcohol",
        "No Pets",
        "Keep Clean"
      ]
    },

    price: { 
      type: DataTypes.DECIMAL(10,2), 
      allowNull: false 
    },
    owner_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {
        model: 'owners',
        key: 'owner_id'
      },
      onDelete: 'CASCADE'
    },
    popular: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: 1
    },
    sharing: { 
      type: DataTypes.JSONB, 
      defaultValue: {} 
    },
    pg_type: { 
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'co-ed'
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    images: {
  type: DataTypes.JSONB,
  allowNull: true,
},
  }, {
    tableName: 'hostels',
    timestamps: false,
  });

  return Hostel;
};
