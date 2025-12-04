export default (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

    bookingId: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  field: "booking_id"
},


      // Foreign keys
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // must match your users table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      hostel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Hostels", // must match your hostels table name
          key: "id",
        },
        onDelete: "CASCADE",
      },

      sharing: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      priceType: {
        type: DataTypes.STRING, // "daily" or "monthly"
        allowNull: false,
      },

      numDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      rentAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      deposit: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("pending_payment", "confirmed", "cancelled"),
        defaultValue: "pending_payment",
      },
 
    },
    {
      tableName: "bookings",
      timestamps: true,
    }
  );

  return Booking;
};
