import React from "react";

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusName) => {
    switch (statusName) {
      case "COMPLETED":
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-500/20";
      case "ONGOING":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200 shadow-blue-500/20";
      case "PENDING":
      case "TODO":
        return "bg-amber-100 text-amber-700 border-amber-200 shadow-amber-500/20";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-100 text-rose-700 border-rose-200 shadow-rose-500/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 shadow-gray-500/20";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getBadgeStyle(
        status
      )} tracking-wider`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
