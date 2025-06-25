import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomsDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelRegistration from "./components/HotelRegistration";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRooms from "./pages/hotelOwner/AddRooms";
import ListRoom from "./pages/hotelOwner/ListRoom";
import { Toaster } from "react-hot-toast";
import { useAppContxt } from "./context/AppContext";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  //const { showHotelReg } = useAppContxt();
  const showHotelReg = useAppContxt()?.showHotelReg;

  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}
      {showHotelReg && <HotelRegistration />}
      <div className="min-h-[70vh">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/rooms" element={<AllRooms />}></Route>
          <Route path="/rooms/:id" element={<RoomsDetails />}></Route>
          <Route path="/my-bookings" element={<MyBookings />}></Route>
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRooms />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
