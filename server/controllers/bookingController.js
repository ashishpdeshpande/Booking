import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Check Availability
// const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
//   try {
//     const bookings = await Booking.find({
//       room,
//       checkInDate: { $lte: checkOutDate },
//       checkOutDate: { $gte: checkInDate },
//     });

//     const isAvailable = bookings.length === 0;
//     return isAvailable;
//   } catch (err) {
//     console.log(err.message);
//   }
// };

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const bookings = await Booking.find({
      room,
      checkInDate: { $lt: checkOut }, // checkIn < existingBooking.checkOut
      checkOutDate: { $gt: checkIn }, // checkOut > existingBooking.checkIn
    });

    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (err) {
    console.log("Error in checkAvailability:", err.message);
    return false;
  }
};

// API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    console.log("🔥 POST /api/bookings/check-availability hit");
    console.log(req.body);

    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    res.json({ success: true, isAvailable });
    console.log("Room availability result:", isAvailable);
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// API to create new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    // Before booking check availablity
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.json({ success: false, message: "Room Is Not Available!" });
    }

    // Get totalPrice from room
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    // Calculate price based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: `🏨 Your QuickStay Booking – ${roomData.hotel.name}`,
      text: `
        Thank you for your booking!

        Booking ID: ${booking._id}
        Hotel: ${roomData.hotel.name}
        Location: ${roomData.hotel.address}
        Check-in: ${booking.checkInDate.toDateString()}
        Price: ₹${booking.totalPrice}
        Guests: ${guests}

        We look forward to your stay.
          `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Booking Created Successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed To Create Booking!" });
  }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user }).populate("room hotel").sort({
      createdAt: -1,
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.json({ success: false, message: "Failed To Fetch Bookings!" });
  }
};

// API to get all bookings for a owner
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth().userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel Found!" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (err) {
    res.json({ success: false, message: "Failed To Fetch Bookings!" });
  }
};
