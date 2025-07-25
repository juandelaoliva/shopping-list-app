import React from 'react';
import { Icons } from './Icons';

interface BottomNavigationProps {
  currentScreen: 'home' | 'products' | 'list' | 'supermarkets';
  onNavigate: (view: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentScreen, onNavigate }) => (
  <nav className="bottom-nav">
    <div className="flex items-center justify-around">
      <button 
        className={currentScreen === 'home' ? 'nav-item-active' : 'nav-item-inactive'}
        onClick={() => onNavigate('home')}
      >
        <span className="nav-icon">{Icons.home}</span>
        <span>Inicio</span>
      </button>
      <button 
        className={currentScreen === 'products' ? 'nav-item-active' : 'nav-item-inactive'}
        onClick={() => onNavigate('products')}
      >
        <span className="nav-icon">{Icons.products}</span>
        <span>Productos</span>
      </button>
      <button 
        className={currentScreen === 'supermarkets' ? 'nav-item-active' : 'nav-item-inactive'}
        onClick={() => onNavigate('supermarkets')}
      >
        <span className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </span>
        <span>Supers</span>
      </button>
    </div>
  </nav>
);

export default BottomNavigation; 