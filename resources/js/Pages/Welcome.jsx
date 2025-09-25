import React from "react";
import { Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
  const user = auth?.user; // safe access

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        {user ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              You are logged in as{" "}
              <span className="font-semibold">{user.role}</span>.
            </p>
 
            {/* Dashboard button */}
            <Link
              href={route("dashboard")}
              className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to the Bootcamp 🚀
            </h1>
            <p className="mt-2 text-gray-600">
              Please log in or register to continue.
            </p>

            {/* Login button */}
            <Link
              href={route("login")}
              className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>

            {/* Register button */}
            <Link
              href={route("register")}
              className="mt-3 inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
