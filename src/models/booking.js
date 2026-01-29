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
      },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },

      hostel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Hostels",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      sharing: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      priceType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      numDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY, // joining date
        allowNull: false,
      },

      // ✅ Stored in DB
      vacateDate: {
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

      hooks: {
        beforeCreate: (booking) => {
          const joinDate = new Date(booking.date);
          joinDate.setDate(joinDate.getDate() + booking.numDays);
          booking.vacateDate = joinDate;
        },

        beforeUpdate: (booking) => {
          if (booking.changed("date") || booking.changed("numDays")) {
            const joinDate = new Date(booking.date);
            joinDate.setDate(joinDate.getDate() + booking.numDays);
            booking.vacateDate = joinDate;
          }
        },
      },
    }
  );

  return Booking;
};