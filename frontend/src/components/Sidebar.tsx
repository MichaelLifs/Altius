import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  
  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        w-64 bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col z-40 border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-center h-16">
          <img 
            src="/MainLogo.png" 
            alt="Altius Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link 
            to="/credentials" 
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              isActive('/credentials') 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm">Credentials</span>
          </Link>
        </nav>
      </div>
    </>
  )
}

export default Sidebar

