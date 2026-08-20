import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from '../common/ScrollToTopButton';

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 32, minHeight: '60vh' }}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
      <ScrollRestoration />
    </div>
  );
}
