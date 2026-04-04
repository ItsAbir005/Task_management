import React, { useContext } from "react";
import { Eye, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

const EmployeeList = () => {
  const { employeeList, setEmployeeList } = useContext(GlobleContext)!;


  const getEmployee = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/admin/getEmployee",
        { withCredentials: true }
      );
      setEmployeeList(res.data.employees);
    } catch (error) {
      console.log(error, "Unable to find Employee");
    }
  };

  useEffect(() => {
    getEmployee();
  }, []);

  return (
    <div className="p-6">
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 font-semibold">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employeeList && employeeList.length > 0 ? (
              employeeList!.map((emp: any) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4">{emp.firstName}</td>
                  <td className="py-3 px-4">{emp.email}</td>
                  <td className="py-3 px-4">{emp.role}</td>
                  <td className="py-3 px-4">{emp.department?.name ?? "N/A"}</td>

                  <td className="py-3 px-4">{emp.createdAt}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${emp.status?.toUpperCase() === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                        }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 flex gap-2">
                    <Link to={`/employee/${emp.id}`}>
                      <button className="p-2 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition cursor-pointer">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>

                    <button className="p-2 rounded-full hover:bg-green-50 text-gray-600 hover:text-green-600 transition cursor-pointer">
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default EmployeeList;
