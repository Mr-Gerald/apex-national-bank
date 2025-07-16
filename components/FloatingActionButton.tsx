import React from 'react';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  to: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ to, icon, ariaLabel }) => {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="fixed bottom-20 right-4 z-50 bg-accent hover:bg-accent-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      {icon}
    </Link>
  );
};

export default FloatingActionButton;