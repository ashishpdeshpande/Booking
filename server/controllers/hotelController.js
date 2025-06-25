import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const hotel = await Hotel.findOne({ owner });
    if (hotel) {
      return res.json({
        success: false,
        message: "Hotel Is Already Registered!",
      });
    }

    await Hotel.create({ name, address, contact, city, owner });

    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Hotel Registered Successully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
