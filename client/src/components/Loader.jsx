import React, { useEffect } from "react";
import { useAppContxt } from "../context/AppContext";
import { useParams } from "react-router-dom";

const Loader = () => {
  const { navigate } = useAppContxt;
  const { nextUrl } = useParams();

  useEffect(() => {
    if (nextUrl) {
      navigate(`/${nextUrl}`);
    }
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="mt-4 text-lg text-gray-600">
        Payment successful! Redirecting to your bookings...
      </p>
    </div>
  );
};

export default Loader;
