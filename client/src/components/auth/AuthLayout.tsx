import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Cover Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.999L12 14 4 8V6l8 6 8-6v1.999z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Retail Management System</h1>
            <p className="text-lg opacity-90 leading-relaxed">
              Streamline your retail operations with our comprehensive management platform. 
              Track inventory, manage sales, analyze performance, and grow your business.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-white/60 rounded-full" />
                <span className="text-sm">Inventory Management</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-white/60 rounded-full" />
                <span className="text-sm">Sales Analytics</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-white/60 rounded-full" />
                <span className="text-sm">Multi-Store Support</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/20 rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-white/10 rounded-full" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.999L12 14 4 8V6l8 6 8-6v1.999z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}