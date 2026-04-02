import React, { useState } from "react";
import axios from "axios";

export default function LeaveManagementForm({ closeForm, onSuccess, onCreateLeave }) {
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // VALIDATION
  const validateForm = () => {
    const { type, startDate, endDate, reason } = formData;

    if (!type || !startDate || !endDate || !reason) {
      return "All fields are required.";
    }

    if (new Date(startDate) > new Date(endDate)) {
      return "End date cannot be before start date.";
    }

    return null;
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) return setErrorMsg(error);

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/admin/applyLeave",
        formData,
        { withCredentials: true }
      );

      onCreateLeave(res.data.leave);

      console.log("Leave applied:", res.data);

      // Parent callback to refresh UI
      if (onSuccess) onSuccess(res.data);

      closeForm();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to apply leave. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg animate-fadeIn">

        <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>

        {/* ERROR BOX */}
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded mb-3 text-sm">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* TYPE */}
          <div>
            <label className="block font-medium mb-1">Leave Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="SICK">SICK</option>
              <option value="CASUAL">CASUAL</option>
              <option value="VACATION">VACATION</option>
              <option value="UNPAID">UNPAID</option>
              <option value="MATERNITY">MATERNITY</option>
              <option value="PATERNITY">PATERNITY</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* REASON */}
          <div>
            <label className="block font-medium mb-1">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded bg-blue-600 text-white cursor-pointer ${
                loading && "opacity-70"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
