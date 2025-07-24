import React from 'react';
import { ShoppingCart, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onNewList?: () => void;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewList, onToggleSidebar, showSidebarToggle = false }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="btn btn-secondary btn-sm lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Lista de Compra
              </h1>
            </Link>
            <Link to="/products" className="text-gray-500 hover:text-gray-900">
              Products
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {onNewList && (
              <button
                onClick={onNewList}
                className="btn btn-primary btn-md"
                aria-label="Nueva lista"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Lista</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 