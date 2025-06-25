import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("DB Connected"));

    await mongoose.connect(`${process.env.MONGODB_URI}/Booking`);
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
