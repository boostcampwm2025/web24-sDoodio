import useDodoToastStore from '@/stores/useDodoToastStore';
import DodoToast from './Toast';

function DodoToastContainer() {
  const { toasts, removeToast } = useDodoToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <DodoToast
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

export default DodoToastContainer;
