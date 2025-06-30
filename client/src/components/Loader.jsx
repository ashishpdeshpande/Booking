import React, { useEffect } from "react";
import { useAppContxt } from "../context/AppContext";
import { useParams } from "react-router-dom";

const Loader = () => {
  const { navigate } = useAppContxt;
  const { nextUrl } = useParams();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate(`/${nextUrl}`);
      }, 3000);
    }
  }, [nextUrl]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
      <p className="mt-4 text-lg text-gray-600">
        Payment successful! Redirecting to your bookings...
      </p>
    </div>
  );
};

export default Loader;
