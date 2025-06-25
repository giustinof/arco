"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaCar, 
  FaCog, 
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaSignOutAlt,
  FaEnvelope,
  FaClock,
  FaDatabase,
  FaUserShield
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const mainItems = [
  { label: "Prenotazioni", href: "/dashboard/appointments", icon: <FaCalendarAlt /> },
  { label: "Clienti", href: "/dashboard/customers", icon: <FaUsers /> },
  { label: "Veicoli", href: "/dashboard/vehicles", icon: <FaCar /> },
  { label: "Comunicazioni", href: "/dashboard/communications", icon: <FaEnvelope /> },
  { label: "Orari", href: "/dashboard/hours", icon: <FaClock /> },
  { label: "Dati", href: "/dashboard/data", icon: <FaDatabase /> },
  { label: "Admin", href: "/dashboard/admin", icon: <FaUserShield /> },
];

const secondaryItems = [
  { label: "Impostazioni", href: "/dashboard/settings", icon: <FaCog /> },
  { label: "Aiuto", href: "/dashboard/help", icon: <FaQuestionCircle /> },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(false);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setHoveredItem(null);
  };

  const sidebarVariants = {
    open: { width: "16rem" },
    closed: { width: "5rem" }
  };

  const textVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 }
  };

  const itemVariants = {
    hover: { 
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      borderLeft: "4px solid rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.2 }
    },
    active: {
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      borderLeft: "4px solid rgba(59, 130, 246, 1)",
      transition: { duration: 0.1 }
    },
    inactive: {
      backgroundColor: "transparent",
      borderLeft: "4px solid transparent",
      transition: { duration: 0.2 }
    }
  };

  const logoVariants = {
    open: { 
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1 }
    },
    closed: { 
      scale: 0.8,
      opacity: 0.8
    }
  };

  const handleRouteChange = () => {
    setHoveredItem(null);
  };

  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Errore nel logout.');

    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Toggle Button */}
      <motion.button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 p-2 rounded-md text-white shadow-lg"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </motion.button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col p-4 fixed h-full z-40 shadow-xl"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              animate={isOpen ? "open" : "closed"}
              variants={textVariants}
              className="text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            >
              A.R.C.O.
            </motion.div>
            <motion.button 
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="bg-gray-700 p-1 rounded-full"
              >
                <FaChevronRight size={16} className="text-gray-300" />
              </motion.div>
            </motion.button>
          </div>

          <nav className="flex flex-col gap-2 mb-8">
            {mainItems.map((item) => (
              <Link href={item.href} key={item.href} onClick={handleRouteChange}>
                <motion.div
                  initial={false}
                  animate={
                    pathname === item.href 
                      ? "active" 
                      : hoveredItem === item.href 
                        ? "hover" 
                        : "inactive"
                  }
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`flex items-center px-3 py-3 rounded-lg ${
                    pathname === item.href ? "font-semibold" : ""
                  }`}
                >
                  <motion.div 
                    className="text-lg mr-3 min-w-[24px] flex justify-center"
                    variants={logoVariants}
                    animate={isOpen ? "open" : "closed"}
                  >
                    {item.icon}
                  </motion.div>
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        key="text"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={textVariants}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <motion.div 
            className="border-t border-gray-700 my-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isOpen ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />

          <nav className="flex flex-col gap-2 mb-8">
            {secondaryItems.map((item) => (
              <Link href={item.href} key={item.href} onClick={handleRouteChange}>
                <motion.div
                  initial={false}
                  animate={
                    pathname === item.href 
                      ? "active" 
                      : hoveredItem === item.href 
                        ? "hover" 
                        : "inactive"
                  }
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`flex items-center px-3 py-3 rounded-lg ${
                    pathname === item.href ? "font-semibold" : ""
                  }`}
                >
                  <motion.div 
                    className="text-lg mr-3 min-w-[24px] flex justify-center"
                    variants={logoVariants}
                    animate={isOpen ? "open" : "closed"}
                  >
                    {item.icon}
                  </motion.div>
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        key="text"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={textVariants}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <motion.div 
            className="border-t border-gray-700 pt-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isOpen ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Logout Button */}
          <motion.button
            whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredItem('logout')}
            onHoverEnd={() => setHoveredItem(null)}
            className="flex items-center w-full px-3 py-3 rounded-lg mt-2 text-red-400"
          >
            <div className="text-lg mr-3 min-w-[24px] flex justify-center">
              <FaSignOutAlt />
            </div>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  key="logout-text"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={textVariants}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="whitespace-nowrap"
                  onClick={handleLogout}
                >
                  Esci
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Version Info */}
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-400 text-center pt-4"
              >
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div>A.R.C.O. System</div>
                  <div className="text-gray-500">v0.1 Alpha</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main 
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "ml-64" : "ml-20"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.main>
    </div>
  );
}