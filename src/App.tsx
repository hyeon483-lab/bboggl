import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <RouterProvider router={router} />
      </AuthModalProvider>
    </AuthProvider>
  );
}

export default App;
