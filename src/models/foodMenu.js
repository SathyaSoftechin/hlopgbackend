// src/models/foodMenu.js
export default (sequelize, DataTypes) => {
  const FoodMenu = sequelize.define('FoodMenu', {
    food_menu_id: { 
      type: DataTypes.BIGINT, 
      primaryKey: true, 
      autoIncrement: true 
    },
    hostel_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {
        model: 'hostels',
        key: 'hostel_id'
      },
      onDelete: 'CASCADE'
    },
    breakfast: { 
      type: DataTypes.JSONB, 
      allowNull: false 
    },
    lunch: { 
      type: DataTypes.JSONB, 
      allowNull: false 
    },
    dinner: { 
      type: DataTypes.JSONB, 
      allowNull: false 
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    }
  }, {
    tableName: 'food_menus',
    timestamps: false,
  });

  return FoodMenu;
};


//Added food menu 