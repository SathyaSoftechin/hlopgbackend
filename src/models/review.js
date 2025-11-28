// src/models/review.js
export default (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: { 
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
    user_id: { 
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    rating: { 
      type: DataTypes.DECIMAL(2, 1), 
      allowNull: false 
    },
    review_text: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    }
  }, {
    tableName: 'reviews',
    timestamps: false,
  });

  return Review;
};