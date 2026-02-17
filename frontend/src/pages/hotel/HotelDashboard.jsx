import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import HotelOverview from "./overview/HotelOverview";
import ShiftsPage from "./shifts/ShiftsPage";
import ApplicationsPage from "./applications/ApplicationsPage";
import HotelProfilePage from "./profile/HotelProfilePage";
import HotelSettingsPage from "./profile/HotelSettingsPage";
import HotelInvoicesPage from "./invoices/HotelInvoicesPage";
import HotelSupportPage from "./support/HotelSupportPage";
import HotelRatingsPage from "./ratings/HotelRatingsPage";

export default function HotelDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
      <div className="min-h-screen bg-slate-50/50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 z-40 flex items-center justify-between px-6">
          <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-900 p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="font-black text-white text-xs">MS</span>
            </div>
            <span className="font-black text-slate-900 tracking-tighter">MY SHIFTERS</span>
          </div>

          <div className="w-10" />
        </header>

        {/* Main content */}
        <main className={`lg:ml-72 min-h-screen pt-20 lg:pt-0 transition-all duration-300`}>
          <div className="p-6 lg:p-12 max-w-7xl mx-auto">
            <Routes>
              <Route index element={<HotelOverview />} />
              <Route path="shifts" element={<ShiftsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="profile" element={<HotelProfilePage />} />
              <Route path="invoices" element={<HotelInvoicesPage />} />
              <Route path="settings" element={<HotelSettingsPage />} />
              <Route path="support" element={<HotelSupportPage />} />
              <Route path="ratings" element={<HotelRatingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
  );
}
