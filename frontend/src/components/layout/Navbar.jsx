// // cat > frontend/src/components/layout/Navbar.jsx << 'EOF'
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { logout } from '../../redux/slices/authSlice';
// import { useState } from 'react';

// export default function Navbar() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useSelector((state) => state.auth);
//   const [showMenu, setShowMenu] = useState(false);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <Link to="/dashboard" className="flex items-center space-x-2">
//               <span className="text-2xl font-bold text-white">📊</span>
//               <span className="hidden sm:inline text-xl font-bold text-white">EMS</span>
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center space-x-4">
//             <span className="text-white text-sm">
//               {user?.firstName} {user?.lastName}
//             </span>
//             <span className="text-xs px-3 py-1 bg-blue-400 text-blue-900 rounded-full font-semibold">
//               {user?.role?.name}
//             </span>
//             <button
//               onClick={handleLogout}
//               className="btn-danger text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
//             >
//               Logout
//             </button>
//           </div>

//           <button
//             onClick={() => setShowMenu(!showMenu)}
//             className="md:hidden text-white"
//           >
//             ☰
//           </button>
//         </div>

//         {showMenu && (
//           <div className="md:hidden pb-4 space-y-2">
//             <span className="block text-white text-sm px-4">
//               {user?.firstName} {user?.lastName}
//             </span>
//             <button
//               onClick={handleLogout}
//               className="w-full text-left px-4 py-2 text-white hover:bg-blue-700"
//             >
//               Logout
//             </button>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }

import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { useState } from 'react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
      <div className="flex justify-between items-center h-full px-6">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span className="text-xl font-bold text-white">EMS</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-white text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </span>

          <span className="text-xs px-3 py-1 bg-white/20 text-white rounded-full backdrop-blur">
            {user?.role?.name}
          </span>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden text-white text-xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden bg-blue-700 px-4 py-3 space-y-2">
          <div className="text-white text-sm">
            {user?.firstName} {user?.lastName}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}