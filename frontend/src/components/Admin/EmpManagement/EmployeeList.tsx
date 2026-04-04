import React, { useContext, useState, useEffect } from "react";
import { Eye, DollarSign, UserX, X } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GlobleContext } from "../../../context/GlobleContext";

const EmployeeList = () => {
  const { employeeList, setEmployeeList } = useContext(GlobleContext)!;
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [salaryInput, setSalaryInput] = useState("");


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

  const handleTerminate = async (empId: string) => {
    if (!window.confirm("Are you sure you want to terminate this employee?")) return;
    try {
      await axios.put(`http://localhost:3000/api/admin/updateEmployee/${empId}`, { status: "TERMINATED" }, { withCredentials: true });
      getEmployee();
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !salaryInput) return;
    try {
      await axios.put(`http://localhost:3000/api/admin/updateEmployee/${selectedEmp.id}`, { salary: salaryInput }, { withCredentials: true });
      setShowSalaryModal(false);
      setSalaryInput("");
      setSelectedEmp(null);
      getEmployee();
    } catch (e) {
      console.log(e);
    }
  };

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
              <th className="py-3 px-4">Salary</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
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
                  <td className="py-3 px-4">{emp.salary ? `$${emp.salary}` : "N/A"}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${emp.status?.toUpperCase() === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : emp.status?.toUpperCase() === "TERMINATED" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-orange-100 text-orange-700"
                        }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 flex gap-2 justify-center">
                    <button 
                      title="View Profile" 
                      onClick={() => {
                        setSelectedEmp(emp);
                        setShowProfileModal(true);
                      }}
                      className="p-2 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition cursor-pointer">
                      <Eye className="w-5 h-5" />
                    </button>

                    <button 
                      title="Update Salary"
                      onClick={() => {
                        setSelectedEmp(emp);
                        setSalaryInput(emp.salary?.toString() || "");
                        setShowSalaryModal(true);
                      }}
                      className="p-2 rounded-full hover:bg-green-50 text-gray-500 hover:text-green-600 transition cursor-pointer">
                      <DollarSign className="w-5 h-5" />
                    </button>

                    {emp.status?.toUpperCase() !== "TERMINATED" && (
                      <button 
                        title="Terminate"
                        onClick={() => handleTerminate(emp.id)}
                        className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer">
                        <UserX className="w-5 h-5" />
                      </button>
                    )}
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

      {/* Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold font-clash text-gray-800">Update Salary</h2>
              <button 
                onClick={() => setShowSalaryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSalary} className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-500 mb-4">
                      Updating salary for <span className="font-semibold text-gray-800">{selectedEmp?.firstName} {selectedEmp?.lastName}</span>
                  </p>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Base Salary</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input 
                      type="number"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      placeholder="e.g. 75000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      required
                    />
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setShowSalaryModal(false)}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Save Salary
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold font-clash text-gray-800">Employee Details</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Name</span>
                 <span className="text-gray-800">{selectedEmp.firstName} {selectedEmp.lastName}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Email</span>
                 <span className="text-gray-800">{selectedEmp.email}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Role</span>
                 <span className="text-gray-800">{selectedEmp.role}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Department</span>
                 <span className="text-gray-800">{selectedEmp.department?.name || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Status</span>
                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedEmp.status?.toUpperCase() === "ACTIVE" ? "bg-green-100 text-green-700" : selectedEmp.status?.toUpperCase() === "TERMINATED" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{selectedEmp.status}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold text-gray-500">Joined Date</span>
                 <span className="text-gray-800">{new Date(selectedEmp.createdAt).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center pb-2">
                 <span className="font-semibold text-gray-500">Base Salary</span>
                 <span className="text-gray-800">{selectedEmp.salary ? `$${selectedEmp.salary.toLocaleString()}` : 'Not Specified'}</span>
               </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeList;
