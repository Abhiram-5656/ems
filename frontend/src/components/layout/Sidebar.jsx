// // cat > frontend/src/components/layout/Sidebar.jsx << 'EOF'
// import { Link, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// export default function Sidebar() {
//   const location = useLocation();
//   const { user } = useSelector((state) => state.auth);

//   const isActive = (path) => location.pathname === path;

//   const menuItems = [
//     { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
//     { path: '/employees', label: 'Employees', icon: '👥', roles: ['ADMIN', 'HR', 'MANAGER'] },
//     { path: '/attendance', label: 'Attendance', icon: '✓', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
//     { path: '/leaves', label: 'Leaves', icon: '📅', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
//     { path: '/payroll', label: 'Payroll', icon: '💰', roles: ['ADMIN', 'HR'] },
//     { path: '/profile', label: 'My Profile', icon: '👤', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
//   ];

//   const filteredItems = menuItems.filter((item) =>
//     item.roles.includes(user?.role?.name)
//   );

//   return (
//     <>
//       {/* Desktop Sidebar - Always visible on desktop */}
//       <div className="hidden md:flex w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-16 flex-col overflow-y-auto z-40">
//         <div className="p-4">
//           <h2 className="text-lg font-bold mb-6">Menu</h2>
//           <nav className="space-y-2">
//             {filteredItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`
//                   flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
//                   ${
//                     isActive(item.path)
//                       ? 'bg-blue-600 text-white font-semibold'
//                       : 'text-gray-300 hover:bg-gray-800'
//                   }
//                 `}
//                 title={item.label}
//               >
//                 <span className="text-xl">{item.icon}</span>
//                 <span>{item.label}</span>
//               </Link>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Mobile Sidebar - Horizontal below header */}
//       <div className="md:hidden bg-gray-900 text-white overflow-x-auto border-b border-gray-800">
//         <nav className="flex space-x-1 p-2">
//           {filteredItems.map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`
//                 flex items-center space-x-2 px-3 py-2 rounded whitespace-nowrap text-sm
//                 ${
//                   isActive(item.path)
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-300 hover:bg-gray-800'
//                 }
//               `}
//             >
//               <span>{item.icon}</span>
//               <span>{item.label}</span>
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// }
// // EOF

import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { path: '/employees', label: 'Employees', icon: '👥', roles: ['ADMIN', 'HR', 'MANAGER'] },
    { path: '/attendance', label: 'Attendance', icon: '✓', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { path: '/leaves', label: 'Leaves', icon: '📅', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { path: '/payroll', label: 'Payroll', icon: '💰', roles: ['ADMIN', 'HR'] },
    { path: '/profile', label: 'My Profile', icon: '👤', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(user?.role?.name)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 fixed top-16 left-0 
        bg-gray-900 text-white min-h-[calc(100vh-4rem)] 
        shadow-xl z-40 transition-all duration-300">

        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-300 mb-6">Menu</h2>

          <nav className="space-y-2">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg 
                  transition-all duration-200 group
                  ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden bg-gray-900 text-white border-b border-gray-800 overflow-x-auto">
        <nav className="flex space-x-2 p-2">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded text-sm
                ${
                  isActive(item.path)
                    ? 'bg-blue-600'
                    : 'text-gray-400'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}