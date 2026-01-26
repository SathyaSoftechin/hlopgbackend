  import jwt from "jsonwebtoken";
  import bcrypt from "bcrypt";
  import axios from "axios";
  import { Hostel } from "../models/index.js";
  import { FoodMenu } from "../models/index.js";


  // Generic function for fetching hostels via ORM
  const fetchHostelsByQuery = async (res, whereClause = {}) => {
    try {
      const hostels = await Hostel.findAll({
        where: whereClause,
        raw: true, // return plain JS objects
      });
      res.json(hostels);
    } catch (err) {
      console.error("Get Hostels Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };

  // ✅ Popular hostels
  export const getHostels = async (req, res) => {
    await fetchHostelsByQuery(res, { popular: "1" });
  };

  // ✅ Hyderabad hostels
  export const hydHostels = async (req, res) => {
    await fetchHostelsByQuery(res, { city: "Hyderabad" });
  };

  // ✅ Chennai hostels
  export const cheHostels = async (req, res) => {
    await fetchHostelsByQuery(res, { city: "Chennai" });
  };

  // ✅ Bangalore hostels
  export const benHostels = async (req, res) => {
    await fetchHostelsByQuery(res, { city: "Bangalore" });
  };

      // ✅ Get hostel by ID
      export const getHostelById = async (req, res) => {
        const { hostel_id } = req.params;
        console.log("🔹 Requested hostel ID:", hostel_id);

        try {
          const hostel = await Hostel.findByPk(hostel_id, { raw: true });
          
          if (!hostel) {
            console.warn("⚠️ Hostel not found for ID:", hostel_id);
            return res.status(404).json({ ok: false, message: "Hostel not found" });
          }

          console.log("✅ Hostel found:", hostel);
          return res.json({ ok: true, data: hostel });
        } catch (error) {
          console.error("❌ Error fetching hostel:", error.message, error);
          return res.status(500).json({ ok: false, message: "Server error" });
        }
      };



  

//    export const addHostel = async (req, res) => {
//   try {

//         if (!req.body) return res.status(400).json({ error: "Request body missing" });

//     console.log("BODY:", req.body);



//     const {
//       pgName,
//       pgInfo,
//       pgType,
//       address,
//       area,
//       city,
//       state,
//       pincode,
//       rules,
//        furnish,
//       sharing,
//       foodMenu
//     } = req.body;

       



// const ownerId = req.owner.owner_id; // 🔐 FROM TOKEN
// if(!ownerId){
//   return res.status(401).json({ error: "Unauthrozed invalid Token" });
// }

// let sharingObj = {};
// if (req.body.sharing) {
//     try {
//         sharingObj = JSON.parse(req.body.sharing);
//     } catch (err) {
//         return res.status(400).json({ error: "Invalid sharing format" });
//     }
// }

//   let minPrice = 0;
// if (sharingObj && Object.keys(sharingObj).length > 0) {
//     const priceList = Object.values(sharingObj);
//     minPrice = Math.min(...priceList);
// }


//     if (!pgName || !pgInfo || !pgType || !address || !city || !area ) {
//       return res.status(400).json({ error: "Please fill all required fields" });
//     }

//     // ✅ FIRST: Create Hostel
//     const newHostel = await Hostel.create({
//       hostel_name: pgName,
//       address,
//       area,
//       city,
//       state,
//       pincode,
//       pg_type: pgType,
//       owner_id: ownerId,
//       amenities: JSON.parse(furnish || "{}"),
//       sharing: JSON.parse(sharing || "{}"),
//       popular: 1,
//       rating: 0.0,
//         price: minPrice ,
//       rules: JSON.parse(rules || "[]")
//     });

//     // -------------------------------------------
//     // ✅ SECOND: Insert Food Menu (IMPORTANT)
//     // -------------------------------------------
//     if (foodMenu) {
//       const menu = JSON.parse(foodMenu);

//       const breakfast = {};
//       const lunch = {};
//       const dinner = {};

//       // Convert frontend format into DB format
//       Object.keys(menu).forEach((day) => {
//         breakfast[day] = menu[day].breakfast || "";
//         lunch[day] = menu[day].lunch || "";
//         dinner[day] = menu[day].dinner || "";
//       });

//       await FoodMenu.create({
//         hostel_id: newHostel.hostel_id,
//         breakfast,
//         lunch,
//         dinner,
//       });
//     }

//     return res.json({
//       success: true,
//       message: "PG & Food Menu Created Successfully",
//       hostel: newHostel
//     });

//   } catch (error) {
//     console.error("Add PG error:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };



export const addHostel = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

    console.log("BODY:", req.body);
    console.log("FILES:", req.files); // 👈 DEBUG
    console.log("FILES:", req.files);


    const {
      pgName,
      pgInfo,
      pgType,
      address,
      area,
      city,
      state,
      pincode,
      rules,
      furnish,
      sharing,
      foodMenu,
    } = req.body;

    const ownerId = req.owner.owner_id;
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized invalid token" });
    }

    // ---------------- Sharing ----------------
    let sharingObj = {};
    if (sharing) {
      try {
        sharingObj = JSON.parse(sharing);
      } catch {
        return res.status(400).json({ error: "Invalid sharing format" });
      }
    }

    let minPrice = 0;
    if (Object.keys(sharingObj).length > 0) {
      minPrice = Math.min(...Object.values(sharingObj));
    }

    if (!pgName || !pgInfo || !pgType || !address || !city || !area) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // ---------------- Images ----------------
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => `/uploads/hostels/${file.filename}`
      );
    }

    // ---------------- Create Hostel ----------------
    const newHostel = await Hostel.create({
      hostel_name: pgName,
      address,
      area,
      city,
      state,
      pincode,
      pg_type: pgType,
      owner_id: ownerId,
      amenities: JSON.parse(furnish || "{}"),
      sharing: sharingObj,
      popular: 1,
      rating: 0.0,
      price: minPrice,
      rules: JSON.parse(rules || "[]"),
      images: imageUrls, // ✅ NEW
    });

    // ---------------- Food Menu ----------------
    if (foodMenu) {
      const menu = JSON.parse(foodMenu);

      const breakfast = {};
      const lunch = {};
      const dinner = {};

      Object.keys(menu).forEach((day) => {
        breakfast[day] = menu[day].breakfast || "";
        lunch[day] = menu[day].lunch || "";
        dinner[day] = menu[day].dinner || "";
      });

      await FoodMenu.create({
        hostel_id: newHostel.hostel_id,
        breakfast,
        lunch,
        dinner,
      });
    }

    return res.json({
      success: true,
      message: "PG, Images & Food Menu Created Successfully",
      hostel: newHostel,
    });
  } catch (error) {
    console.error("Add PG error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


export const updateHostel = async (req, res) => {
  try {
    const { hostel_id } = req.params;
    if (!hostel_id) {
      return res.status(400).json({ error: "Hostel ID is required" });
    }

    const ownerId = req.owner.owner_id;
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized invalid token" });
    }

    const hostel = await Hostel.findOne({ where: { hostel_id, owner_id: ownerId } });
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found or you are not the owner" });
    }

    const {
      pgName,
      pgInfo,
      pgType,
      location,
      rules,
      furnish,
      sharing,
      foodMenu,
    } = req.body;

    // ---------------- Parse location ----------------
    let address = "", area = "", city = "", state = "", pincode = "";
    if (location) {
      try {
        const loc = JSON.parse(location);
        address = loc.address || "";
        area = loc.area || "";
        city = loc.city || "";
        state = loc.state || "";
        pincode = loc.pincode || "";
      } catch {
        return res.status(400).json({ error: "Invalid location format" });
      }
    }

    // if (!pgName || !pgInfo || !pgType || !address || !city || !area) {
    //   return res.status(400).json({ error: "Please fill all required fields" });
    // }

    // ---------------- Parse sharing ----------------
    let sharingObj = {};
    if (sharing) {
      try {
        sharingObj = JSON.parse(sharing);
      } catch {
        return res.status(400).json({ error: "Invalid sharing format" });
      }
    }

    let minPrice = 0;
    if (Object.keys(sharingObj).length > 0) {
      minPrice = Math.min(...Object.values(sharingObj));
    }

    // ---------------- Parse rules & amenities ----------------
    let rulesArr = [];
    if (rules) {
      try {
        rulesArr = JSON.parse(rules);
      } catch {
        return res.status(400).json({ error: "Invalid rules format" });
      }
    }

    let furnishObj = {};
    if (furnish) {
      try {
        furnishObj = JSON.parse(furnish);
      } catch {
        return res.status(400).json({ error: "Invalid furnish format" });
      }
    }

    // ---------------- Handle new images ----------------
    let newImageUrls = hostel.images || [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => `/uploads/hostels/${file.filename}`);
      newImageUrls = [...newImageUrls, ...uploadedImages];
    }

    // ---------------- Update Hostel ----------------
    await hostel.update({
      hostel_name: pgName,
      hostel_info: pgInfo,
      pg_type: pgType,
      address,
      area,
      city,
      state,
      pincode,
      amenities: furnishObj,
      sharing: sharingObj,
      rules: rulesArr,
      images: newImageUrls,
      price: minPrice,
    });

    // ---------------- Update Food Menu ----------------
    if (foodMenu) {
      const menu = JSON.parse(foodMenu);
      const breakfast = {};
      const lunch = {};
      const dinner = {};

      Object.keys(menu).forEach(day => {
        breakfast[day] = menu[day].breakfast || "";
        lunch[day] = menu[day].lunch || "";
        dinner[day] = menu[day].dinner || "";
      });

      let existingMenu = await FoodMenu.findOne({ where: { hostel_id } });
      if (existingMenu) {
        await existingMenu.update({ breakfast, lunch, dinner });
      } else {
        await FoodMenu.create({ hostel_id, breakfast, lunch, dinner });
      }
    }

    return res.json({ success: true, message: "PG Updated Successfully", hostel });

  } catch (error) {
    console.error("Update PG error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

