import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

export default function AddProjectForm({ onClose, onCreateProject }: { onClose: () => void, onCreateProject: (proj: any) => void }) {
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    managerId: "",
    deadline: "",
  });

  const { employeeList, setEmployeeList } = useContext(GlobleContext)!;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: newProject.name,
      client: newProject.client,
      managerId: newProject.managerId,
      deadline: newProject.deadline,
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
            {employeeList.filter((m: any) => m.role === "MANAGER").map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.department?.name || 'No Dept'})
              </option>
            ))}
          </select>

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
