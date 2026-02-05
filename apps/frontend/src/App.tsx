import { AppRoutes } from '@/routes';
import { ToastContainer } from 'react-toastify';
import { DodoToastContainer } from '@/shared/components/DodoToast';

export function App() {
  return (
    <>
      <AppRoutes />
      <DodoToastContainer />
      <ToastContainer
        className="toast-position"
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
      />
    </>
  );
}
