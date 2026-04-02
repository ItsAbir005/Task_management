import React, { useState, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../context/GlobleContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(GlobleContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "ADMIN",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        form.role === "ADMIN"
          ? "http://localhost:3000/api/auth/login"
          : "http://localhost:3000/api/auth/employeeLogin";

      const res = await axios.post(
        endpoint,
        {
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      setUser(res.data);
      const role = res.data.role;

      // ✅ Redirect based on role
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "HR") {
        navigate("/hr/dashboard");
      } else if (role === "EMPLOYEE") {
        navigate("/employee/dashboard");
      } else if (role === "MANAGER") {
        navigate("/manager/dashboard");
      } else {
        console.log("Invalid role");
        navigate("/");
      }

      console.log("Login success:", receivedUser);
    } catch (error) {
      console.log("Login Error =>", error?.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 outline-none focus:ring"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 outline-none focus:ring"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg mt-4"
        >
          Login
        </button>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Register Now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
