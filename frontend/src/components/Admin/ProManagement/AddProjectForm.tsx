import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

export default function AddProjectForm({ onClose, onCreateProject }) {
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    managerId: "",
    deadline: "",
    memberIds: [],
  });

  const { employeeList, setEmployeeList } = useContext(GlobleContext);
  const [employeeInput, setEmployeeInput] = useState("");

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/admin/getEmployee",
        { withCredentials: true }
      );
      setEmployeeList(res.data.employees);
    } catch (error) {
      console.log("Unable to find Employee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: newProject.name,
      client: newProject.client,
      managerId: newProject.managerId,
      deadline: newProject.deadline,
      memberIds: newProject.memberIds,
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/admin/addProject",
        payload,
        { withCredentials: true }
      );

      // ⭐ Update UI Immediately
      if (res.data.project) {
        onCreateProject(res.data.project);
      }

      onClose();
    } catch (error) {
      console.log("Error creating project:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] md:w-[500px] shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            className="border rounded-lg p-2"
            required
          />

          <input
            type="text"
            placeholder="Client Name"
            value={newProject.client}
            onChange={(e) =>
              setNewProject({ ...newProject, client: e.target.value })
            }
            className="border rounded-lg p-2"
            required
          />

          <input
            type="date"
            value={newProject.deadline}
            onChange={(e) =>
              setNewProject({ ...newProject, deadline: e.target.value })
            }
            className="border rounded-lg p-2"
          />

          <select
            value={newProject.managerId}
            onChange={(e) =>
              setNewProject({ ...newProject, managerId: e.target.value })
            }
            className="border rounded-lg p-2 cursor-pointer"
            required
          >
            <option value="">Select Manager</option>
            {employeeList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName}
              </option>
            ))}
          </select>

          <div className="flex gap-2 mt-2">
            <select
              value={employeeInput}
              onChange={(e) => setEmployeeInput(e.target.value)}
              className="border rounded-lg p-2 flex-1 cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (!employeeInput) return;

                setNewProject((prev) => ({
                  ...prev,
                  memberIds: [...prev.memberIds, employeeInput],
                }));

                setEmployeeInput("");
              }}
              className="px-3 py-2 bg-green-600 text-white rounded-lg"
            >
              Add
            </button>
          </div>

          <ul className="list-disc list-inside text-gray-700 mt-2">
            {newProject.memberIds.map((empId, i) => {
              const emp = employeeList.find((e) => e.id === empId);
              return (
                <li key={i}>
                  {emp ? emp.firstName : empId}
                  <button
                    type="button"
                    onClick={() =>
                      setNewProject((prev) => ({
                        ...prev,
                        memberIds: prev.memberIds.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-sm text-red-600 ml-2"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
