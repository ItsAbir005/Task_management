import React, { useState, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

const CreateDepartmentForm = ({ onClose }) => {
  const { setDepartments } = useContext(GlobleContext);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/admin/addDepartment", { name }, { withCredentials: true });
      console.log("Department created:", res.data);

      if (res.data.department) {
        setDepartments((prev) => [...prev, res.data.department]);
      }

      setName("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Blur Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Create Department
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="departmentName"
              className="block text-sm font-medium text-gray-700"
            >
              Department Name
            </label>
            <input
              type="text"
              id="departmentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 cursor-pointer ${loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Saving..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentForm;
