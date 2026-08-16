import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { ContactModalProvider } from './context/ContactModalContext';

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <ContactModalProvider>
          <RouterProvider router={router} />
        </ContactModalProvider>
      </AuthModalProvider>
    </AuthProvider>
  );
}

export default App;
