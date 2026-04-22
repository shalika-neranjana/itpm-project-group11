import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/dist/sweetalert2.min.css'

const MySwal = withReactContent(Swal)

export const toast = (message, icon = 'success') =>
  MySwal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
  })

export const success = (message, title = 'Success') =>
  MySwal.fire({ icon: 'success', title, text: message, confirmButtonColor: '#3B82F6' })

export const error = (message, title = 'Error') =>
  MySwal.fire({ icon: 'error', title, text: message, confirmButtonColor: '#DC2626' })

export const warning = (message, title = 'Warning') =>
  MySwal.fire({ icon: 'warning', title, text: message, confirmButtonColor: '#F59E0B' })

export const info = (message, title = 'Info') =>
  MySwal.fire({ icon: 'info', title, text: message, confirmButtonColor: '#6366F1' })

export const confirm = async (message, options = {}) => {
  const result = await MySwal.fire({
    title: options.title || 'Confirm',
    text: message,
    icon: options.icon || 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Yes',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })
  return result.isConfirmed
}

export const prompt = async (message, options = {}) => {
  const result = await MySwal.fire({
    title: options.title || message,
    input: options.input || 'text',
    inputLabel: options.inputLabel || '',
    inputPlaceholder: options.placeholder || '',
    inputValue: options.value || '',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Submit',
  })
  if (result.isConfirmed) return result.value
  return null
}
