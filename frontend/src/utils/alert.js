import Swal from 'sweetalert2';

const swalTheme = {
  background: '#1a1d27',
  color: '#f0f2f5',
  confirmButtonColor: '#6c5ce7',
  cancelButtonColor: '#e74c3c',
};

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  ...swalTheme,
});

export const showSuccess = (text) => toast.fire({ icon: 'success', title: text });
export const showError = (text) => toast.fire({ icon: 'error', title: text });

export const confirmDelete = (itemName = 'this item') =>
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${itemName}. This cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    ...swalTheme,
  });

export const confirmAction = (title, text) =>
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    ...swalTheme,
  });
