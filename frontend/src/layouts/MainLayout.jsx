import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120] text-slate-100 selection:bg-red-500 selection:text-white">
      <EmergencyBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
