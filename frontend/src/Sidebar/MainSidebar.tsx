import { useContext, useEffect } from 'react'
import { GlobleContext } from '../context/GlobleContext'
import AdminSidebar from './AdminSidebar'
import EmpSidebar from './EmpSidebar'
import HRSidebar from './HrSidebar'
import MangSidebar from './MangSidebar'

const MainSidebar = () => {
  const context = useContext(GlobleContext);

  if (!context) return null;
  const { user, logout } = context;

  useEffect(() => {
    console.log("Sidebar user =>", user);
  }, [user]);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      {user.role === "ADMIN" && <AdminSidebar logout={logout} user={user} />}
      {user.role === "EMPLOYEE" && <EmpSidebar logout={logout} user={user} />}
      {user.role === "HR" && <HRSidebar logout={logout} user={user} />}
      {user.role === "MANAGER" && <MangSidebar logout={logout} user={user} />}
    </>
  )
}

export default MainSidebar;
