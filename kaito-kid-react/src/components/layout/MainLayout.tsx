// Layout chính cho trang khách hàng
// Thay thế việc copy/paste header + footer vào mỗi file HTML

import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
