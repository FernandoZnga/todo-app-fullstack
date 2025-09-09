import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  CheckSquare, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Settings
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  const isActiveLink = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <CheckSquare className="h-8 w-8 text-primary-900" />
                <span className="ml-2 text-xl font-bold text-primary-900">
                  TODO App
                </span>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                        isActiveLink(item.href)
                          ? 'text-primary-900 border-b-2 border-primary-900'
                          : 'text-primary-600 hover:text-primary-900 hover:border-b-2 hover:border-primary-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              {/* User Info */}
              <div className="hidden md:flex md:items-center md:ml-6">
                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.nombreUsuario?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="ml-3 text-primary-700 font-medium">
                      {user?.nombreUsuario || 'Usuario'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="ml-6 flex items-center text-primary-600 hover:text-primary-900 transition-colors duration-200"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-primary-600 hover:text-primary-900 hover:bg-primary-100 transition-colors duration-200"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-primary-100">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                        isActiveLink(item.href)
                          ? 'text-primary-900 bg-primary-50 border-r-4 border-primary-900'
                          : 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
              
              {/* Mobile User Info */}
              <div className="pt-4 pb-3 border-t border-primary-200">
                <div className="flex items-center px-4">
                  <div className="h-10 w-10 bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.nombreUsuario?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-primary-800">
                      {user?.nombreUsuario || 'Usuario'}
                    </div>
                    <div className="text-sm text-primary-500">
                      {user?.correo}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
