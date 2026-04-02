import React from 'react'
import { Outlet } from 'react-router-dom'
import MainSidebar from '../Sidebar/MainSidebar'
import Navbar from '../components/Common/Navbar'


const MainLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50/50">
      <MainSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


export default MainLayout
