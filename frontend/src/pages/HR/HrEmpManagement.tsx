import React from 'react'
import EmployeeStats from '../../components/Admin/EmpManagement/EmployeeStats'
import EmployeeList from '../../components/Admin/EmpManagement/EmployeeList'

const HrEmpManagement = () => {
  return (
    <div>
      <section>
          <EmployeeStats/>
        </section>
        <section className="bg-white rounded-xl shadow-md p-4">
          <EmployeeList />
        </section>
    </div>
  )
}

export default HrEmpManagement
