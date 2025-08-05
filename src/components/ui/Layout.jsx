import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full pt-20 pb-16 md:pb-0 min-h-screen">
        <Outlet /> 
        {/* هنا تظهر صفحاتك (Dashboard, Profile, ...إلخ) */}
      </main>
      <BottomNav />
    </div>
  );
}
