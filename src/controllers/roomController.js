// roomController.js
import { Room } from "../models/index.js";

export const bulkCreateRooms = async (req, res) => {
  try {
    const { hostel_id, floors } = req.body;

    const roomsToCreate = [];

    floors.forEach(floor => {
      floor.rooms.forEach(room => {
        roomsToCreate.push({
          hostel_id: hostel_id,       // <-- You must include this!
          floor: floor.floorNumber,
          room_number: room.roomNo,
          sharing: room.beds.length,
          status: 'available',
          price: 0
        });
      });
    });

    const createdRooms = await Room.bulkCreate(roomsToCreate);

    res.status(201).json({ message: 'Rooms created successfully', rooms: createdRooms });
  } catch (error) {
    console.error('Bulk Room Creation Error:', error);
    res.status(500).json({ error: error.message });
  }
};


// GET all rooms for given hostel
export const getRoomsByHostel = async (req, res) => {
  try {
    const { hostel_id } = req.params;

    const rooms = await Room.findAll({
      where: { hostel_id },
      order: [["room_number", "ASC"]],
    });

    if (!rooms || rooms.length === 0) {
 return res.status(200).json({
      ok: true,
      rooms: rooms, // empty array if no rooms
    });    }

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE multiple rooms for given hostel
export const updateRoomsByHostel = async (req, res) => {
  try {
    const { hostel_id } = req.params;
    const { rooms } = req.body;

    if (!Array.isArray(rooms)) {
      return res.status(400).json({ message: "Rooms must be an array" });
    }

    const updatePromises = rooms.map((room) =>
      Room.update(
        {
          sharing: room.sharing,
          price: room.price,
          status: room.status,
        },
        { where: { room_id: room.room_id, hostel_id } }
      )
    );

    await Promise.all(updatePromises);

    res.json({ message: "Rooms updated successfully" });
  } catch (err) {
    console.error("Error updating rooms:", err);
    res.status(500).json({ message: "Failed to update rooms" });
  }
};




export const saveRoomsByHostel = async (req, res) => {
  try {
    const { hostel_id } = req.params;
    const { rooms } = req.body;

    if (!Array.isArray(rooms)) {
      return res.status(400).json({ message: "Rooms must be an array" });
    }

    // Fetch existing rooms from DB
    const existingRooms = await Room.findAll({ where: { hostel_id } });
    const existingIds = existingRooms.map(r => r.room_id);

    const incomingIds = rooms
      .filter(r => r.room_id) // only rooms with id
      .map(r => r.room_id);

    // 1️⃣ Delete removed rooms
    const roomsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (roomsToDelete.length > 0) {
      await Room.destroy({ where: { room_id: roomsToDelete } });
    }

    // 2️⃣ Update existing rooms
    const updatePromises = rooms
      .filter(r => r.room_id)
      .map((room) =>
        Room.update(
          {
            room_number: room.room_number,
            sharing: room.sharing,
            price: room.price,
            status: room.status,
          },
          { where: { room_id: room.room_id } }
        )
      );
    await Promise.all(updatePromises);

    // 3️⃣ Create new rooms
    const newRooms = rooms.filter(r => !r.room_id).map((room) => ({
      hostel_id,
      floor: room.floor,
      room_number: room.room_number,
      sharing: room.sharing,
      price: room.price,
      status: room.status,
    }));
    if (newRooms.length > 0) {
      await Room.bulkCreate(newRooms);
    }

    res.json({ message: "Rooms saved successfully" });
  } catch (err) {
    console.error("Error saving rooms:", err);
    res.status(500).json({ message: "Failed to save rooms" });
  }
};
// export const saveRoomsByHostel = async (req, res) => {
//   try {
//     const { hostel_id } = req.params;
//     const { rooms } = req.body;

//     if (!Array.isArray(rooms)) {
//       return res.status(400).json({ message: "Rooms must be an array" });
//     }

//     const updatePromises = [];
//     const newRooms = [];

//     rooms.forEach((room) => {
//       if (room.room_id) {
//         // Update existing room
//         updatePromises.push(
//           Room.update(
//             {
//               sharing: room.sharing,
//               price: room.price,
//               status: room.status,
//               room_number: room.room_number,
//               floor: room.floor,
//             },
//             { where: { room_id: room.room_id, hostel_id } }
//           )
//         );
//       } else {
//         // Add new room
//         newRooms.push({
//           hostel_id,
//           floor: room.floor,
//           room_number: room.room_number,
//           sharing: room.sharing,
//           status: room.status || "available",
//           price: room.price || 0,
//         });
//       }
//     });

//     // Execute updates
//     await Promise.all(updatePromises);

//     // Create new rooms if any
//     if (newRooms.length) {
//       await Room.bulkCreate(newRooms);
//     }

//     res.json({ message: "Rooms saved successfully" });
//   } catch (err) {
//     console.error("Error saving rooms:", err);
//     res.status(500).json({ message: "Failed to save rooms" });
//   }
// };