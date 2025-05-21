import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  BarChart2,
  Users,
  Calendar,
  Settings,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

const Home: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Handle scroll events for navbar changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    });

    const sections = ["features", "testimonials", "stats"];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
        observerRefs.current[section] = element;
      }
    });

    // Copy the current ref values to a local variable for cleanup
    const observedElements = { ...observerRefs.current };

    return () => {
      sections.forEach((section) => {
        const element = observedElements[section];
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const featureCards = [
    {
      icon: <BarChart2 size={32} className="mb-4 text-blue-500" />,
      title: "Performance Analytics",
      description:
        "Track KPIs and performance metrics with intuitive dashboards and real-time data visualization.",
    },
    {
      icon: <Users size={32} className="mb-4 text-blue-500" />,
      title: "HR Management",
      description:
        "Streamline onboarding, personnel management, and workforce planning with integrated tools.",
    },
    {
      icon: <Calendar size={32} className="mb-4 text-blue-500" />,
      title: "Project Tracking",
      description:
        "Monitor project progress, deadlines, and resource allocation in one centralized system.",
    },
    {
      icon: <Settings size={32} className="mb-4 text-blue-500" />,
      title: "Customizable Workflows",
      description:
        "Design and automate business processes that adapt to your organization's unique needs.",
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-gray-800 overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full z-30 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-lg py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h1
                className={`text-xl font-bold tracking-tight ${
                  isScrolled ? "text-blue-900" : "text-white"
                }`}
              >
                Corporate<span className="text-blue-500">MS</span>
              </h1>
            </motion.div>
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {["Home", "Features"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-800" : "text-white"
                  } hover:text-blue-500`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition duration-200 shadow-md"
                >
                  Sign In
                </Link>
              </motion.div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMobileMenu}
                className={`focus:outline-none p-2 ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isMobileMenuOpen ? "auto" : 0,
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            {isMobileMenuOpen && (
              <div className="px-4 py-5 space-y-4 bg-white shadow-lg rounded-b-lg mt-2">
                {["Home", "Features", "Pricing"].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={toggleMobileMenu}
                    className="block font-medium text-gray-800 hover:text-blue-600"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Link
                    to="/login"
                    onClick={toggleMobileMenu}
                    className="block bg-blue-600 text-white text-center px-5 py-2.5 rounded-md font-medium hover:bg-blue-700 transition duration-200 shadow-md"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(59, 130, 246, 0.75))`,
        }}
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-left"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-blue-700/30 text-blue-100 rounded-full"
              >
                Next Generation Enterprise Solution
              </motion.span>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
              >
                Transform Your Corporate Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg sm:text-xl mb-8 max-w-xl text-blue-50"
              >
                Streamline operations, enhance productivity, and gain actionable
                insights with our comprehensive enterprise management platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center shadow-lg transition duration-200"
                  >
                    Get Started
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden md:block"
            >
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white p-1 rounded-xl shadow-2xl">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="h-6 bg-gray-900 flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-blue-100/10 rounded mb-4"></div>
                        <div className="h-4 bg-blue-100/10 rounded mb-4 w-5/6"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="h-10 w-10 rounded bg-blue-100/10"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100/10 rounded mb-2"></div>
                            <div className="h-4 bg-blue-100/10 rounded w-4/6"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="h-24 bg-blue-100/10 rounded"></div>
                          <div className="h-24 bg-blue-100/10 rounded"></div>
                          <div className="h-24 bg-blue-100/10 rounded"></div>
                        </div>
                        <div className="h-4 bg-blue-100/10 rounded mb-4"></div>
                        <div className="h-4 bg-blue-100/10 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.a
            href="#features"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="block text-white"
            aria-label="Scroll to features section"
          >
            <ChevronDown size={30} />
          </motion.a>
        </motion.div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-20 text-slate-50"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,214.86,129.48Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isVisible.features ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900"
            >
              All-in-One Management Solution
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg text-gray-600"
            >
              Our platform provides the tools you need to manage your entire
              organization efficiently and effectively.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isVisible.features ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white p-8 rounded-xl shadow-md text-center hover:border-blue-500 border-2 border-transparent transition-all duration-300"
              >
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isVisible.stats ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4"
            >
              Impact
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900"
            >
              Driving Business Results
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg text-gray-600"
            >
              Organizations that implement our solution see substantial
              improvements in key performance metrics.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isVisible.stats ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              { value: "98%", label: "Client Retention" },
              { value: "32%", label: "Efficiency Increase" },
              { value: "4.9/5", label: "Customer Satisfaction" },
              { value: "10x", label: "ROI Average" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-md text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    delay: index * 0.1,
                  }}
                  className="text-4xl font-bold text-blue-600 mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6">
            <p className="text-gray-400 text-xs">
              © 2025 Corporate Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
