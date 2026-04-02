import React from 'react'
import DepartmentList from '../../components/Admin/DepartManagement/DepartmentList'

const HrDepManagement = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Department Management</h1>

      <DepartmentList />
    </div>
  )
}

export default HrDepManagement
