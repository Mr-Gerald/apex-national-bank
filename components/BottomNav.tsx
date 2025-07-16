
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, WalletIcon, ArrowPathIcon, UserCircleIcon } from '../constants';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center space-y-1 p-2 flex-1 ${
          isActive ? 'text-primary scale-110' : 'text-neutral-500 hover:text-primary'
        } transition-all duration-150 ease-in-out`
      }
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
};

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-neutral-200 shadow-top flex justify-around items-center h-16 z-50">
      <NavItem to="/dashboard" icon={<HomeIcon className="w-6 h-6" />} label="Home" />
      <NavItem to="/accounts" icon={<WalletIcon className="w-6 h-6" />} label="Accounts" />
      <NavItem to="/transfer" icon={<ArrowPathIcon className="w-6 h-6" />} label="Transfer" />
      <NavItem to="/profile" icon={<UserCircleIcon className="w-6 h-6" />} label="Profile" />
    </nav>
  );
};

export default BottomNav;
