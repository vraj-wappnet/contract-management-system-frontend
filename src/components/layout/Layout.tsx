// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../../store/store";
// import { logout } from "../../store/slices/authSlice";
// import Sidebar from "./Sidebar";
// import { Menu, User } from "lucide-react";
// import { cn } from "../../lib/utils";

// interface LayoutProps {
//   children?: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { user } = useAppSelector((state) => state.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login");
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//   };

//   const toggleUserMenu = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setUserMenuOpen(!userMenuOpen);
//   };

//   // Close user menu when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = () => {
//       if (userMenuOpen) {
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, [userMenuOpen]);

//   return (
//     <div className="min-h-screen bg-white flex">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-20 bg-black/50 md:hidden"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200",
//           "transform transition-transform duration-300 ease-in-out",
//           sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
//         )}
//       >
//         <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
//       </aside>

//       <div className={cn("flex-1 flex flex-col overflow-hidden", "md:ml-64")}>
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200">
//           <div className="px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between h-16">
//               <div className="flex items-center">
//                 <button
//                   onClick={toggleSidebar}
//                   className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
//                 >
//                   <span className="sr-only">Open sidebar</span>
//                   <Menu className="h-6 w-6" aria-hidden="true" />
//                 </button>
//               </div>
//               <div className="flex items-center">
//                 <div className="relative">
//                   <button
//                     type="button"
//                     className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
//                     onClick={toggleUserMenu}
//                   >
//                     <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
//                       <User className="h-4 w-4 text-gray-600" />
//                     </div>
//                     <span className="hidden md:inline">
//                       {user?.firstName} {user?.lastName}
//                     </span>
//                   </button>

//                   {userMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-40">
//                       <div className="px-4 py-2 border-b border-gray-100">
//                         <p className="text-sm text-gray-700">
//                           {user?.firstName} {user?.lastName}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           {user?.email}
//                         </p>
//                       </div>

//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                       >
//                         Sign out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main content */}
//         <main className="flex-1 overflow-auto bg-gray-50">
//           <div className="py-6">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               {children}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logout } from "../../store/slices/authSlice";
import Sidebar from "./Sidebar";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.charAt(0) || ""}${
      user?.lastName?.charAt(0) || ""
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 shadow-lg",
          "transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </aside>

      <div className={cn("flex-1 flex flex-col overflow-hidden", "md:ml-64")}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-2 md:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="ml-2 md:hidden text-lg font-semibold text-gray-800">
                  Dashboard
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* User dropdown */}
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={toggleUserMenu}
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
                      <span>{getInitials()}</span>
                    </div>
                    <div className="hidden md:flex items-center">
                      <span className="text-gray-700 font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronDown
                        className={cn(
                          "ml-1 h-4 w-4 text-gray-500 transition-transform duration-200",
                          userMenuOpen ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 ring-1 ring-black ring-opacity-5 z-40 divide-y divide-gray-100 origin-top-right transition-all duration-200 ease-out">
                      <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-900 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-red-500 group-hover:text-red-600" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
