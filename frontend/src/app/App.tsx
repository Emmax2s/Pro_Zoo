import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ZooProvider } from './context/ZooContext';
import { AuthProvider } from './context/AuthContext';
import './i18n';

export default function App() {
  return (
    <AuthProvider>
      <ZooProvider>
        <RouterProvider router={router} />
      </ZooProvider>
    </AuthProvider>
  );
}