import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing setup token");
      return;
    }

    console.log(token, password)

    try {
      const res = await axios.post("http://localhost:3000/api/auth/setPassword", {
        token,
        password,
      });

      if (res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Redirect to login after 2 seconds
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong Setting Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Create Password</h2>

        {!token ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">No token found in the URL. Please use the link from your email.</span>
          </div>
        ) : success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
            <span className="block sm:inline">Password set successfully! Redirecting to login...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 text-sm">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-1 font-medium">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-200"
                required
                minLength="6"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg p-2 outline-none focus:ring focus:ring-blue-200"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg"
            >
              Set Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
