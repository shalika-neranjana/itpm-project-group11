function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  rightAdornment,
  error,
  required = false
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30' : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {rightAdornment ? <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightAdornment}</div> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default InputField
