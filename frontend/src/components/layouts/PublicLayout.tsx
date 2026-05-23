import { Outlet } from 'react-router-dom';
import { Navbar } from '@components/navigation/Navbar';
import { Footer } from '@components/navigation/Footer';
import { CartDrawer } from '@components/cart/CartDrawer';
import { SearchOverlay } from '@components/search/SearchOverlay';
import { MobileBottomNav } from '@components/navigation/MobileBottomNav';

export const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pb-24 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <CartDrawer />
    <SearchOverlay />
    <MobileBottomNav />
  </div>
);
