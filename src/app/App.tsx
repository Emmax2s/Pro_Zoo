import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ZooProvider } from './context/ZooContext';
import './i18n';

export default function App() {
  return (
    <ZooProvider>
      <RouterProvider router={router} />
    </ZooProvider>
  );
}