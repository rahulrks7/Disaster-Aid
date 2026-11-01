import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white font-display">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2">
        The disaster response route you requested does not exist or has been relocated.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="primary" size="md" icon={Home}>
          Return to Command Center
        </Button>
      </Link>
    </div>
  );
};
