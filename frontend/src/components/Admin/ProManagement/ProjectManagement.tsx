import React, { useState, useEffect, useContext } from "react";
import { PlusCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddProjectForm from "./AddProjectForm";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const { projects, setProjects } = useContext(GlobleContext);

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter(
          (p) => p?.status?.toLowerCase() === activeTab.toLowerCase()
        );

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ADD NEW PROJECT TO STATE IMMEDIATELY
  const handleProjectCreate = (newProj) => {
    setProjects((prev) => [...prev, newProj]);
  };

  const deleteProject = async (projectId) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/admin/deleteProject/${projectId}`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setProjects((prev) => prev.filter((proj) => proj.id !== projectId));
      }
    } catch (error) {
      console.log("Unable to delete project", error);
    }
  };

  const getProject = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/admin/getProject",
        { withCredentials: true }
      );
      setProjects(response.data.projects || []);
    } catch (error) {
      console.log("Unable to fetch projects", error);
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Project Management</h1>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 cursor-pointer"
        >
          <PlusCircle size={20} /> Create Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["all", "ongoing", "completed", "pending"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full capitalize shadow cursor-pointer ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab} Projects
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => {
            const isOpen = expandedId === proj.id;

            return (
              <div
                key={proj.id}
                className="border rounded-xl p-4 bg-white shadow transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{proj?.name}</h3>
                    <p className="text-gray-600">Client: {proj?.client}</p>

                    <span className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
                      {proj?.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(proj.id)}
                      className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
                    >
                      {isOpen ? (
                        <>
                          View Less <ChevronUp size={18} />
                        </>
                      ) : (
                        <>
                          View More <ChevronDown size={18} />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="expand"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mt-4 border-t pt-4"
                    >
                      <div className="mb-4">
                        <p className="font-medium">
                          Manager: {proj?.manager?.firstName}{" "}
                          {proj?.manager?.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {proj?.manager?.email}
                        </p>
                      </div>

                      <p className="mt-1">
                        <span className="font-medium">Deadline:</span>{" "}
                        {proj?.deadline}
                      </p>

                      <p className="mt-1">
                        <span className="font-medium">Created At:</span>{" "}
                        {new Date(proj?.createdAt).toLocaleDateString()}
                      </p>

                      <p className="mt-1">
                        <span className="font-medium">Updated At:</span>{" "}
                        {new Date(proj?.updatedAt).toLocaleDateString()}
                      </p>

                      <div className="mt-4">
                        <span className="font-medium">Team Members:</span>

                        <ul className="mt-2 grid grid-cols-2 gap-3 text-gray-700">
                          {proj?.members?.length > 0 ? (
                            proj.members.map((emp) => (
                              <li
                                key={emp.id}
                                className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 hover:shadow transition cursor-pointer"
                              >
                                <div className="flex flex-col leading-tight">
                                  <span className="font-medium">
                                    {emp.firstName} {emp.lastName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {emp.email}
                                  </span>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500 mt-2 list-none">
                              No members assigned
                            </li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 mt-4">No projects in this category.</p>
        )}
      </div>

      {showForm && (
        <AddProjectForm
          onClose={() => setShowForm(false)}
          onCreateProject={handleProjectCreate}
        />
      )}
    </div>
  );
}
