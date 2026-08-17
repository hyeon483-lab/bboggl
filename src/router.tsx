import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import MyPage from './pages/MyPage';
import About from './pages/About';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'companies', element: <Companies /> },
      { path: 'companies/:ticker', element: <CompanyDetail /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'about', element: <About /> },
      { path: 'privacy', element: <Privacy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
