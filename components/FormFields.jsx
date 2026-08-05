// Reusable labeled input/select field with error message display.
export default function FormFields({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  options,
  placeholder,
  className = "",
}) {
  const inputId = `field-${name}`;
  const isSelect = type === "select";

  const controlClassName = `w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 focus:ring-red-300"
      : "border-gray-300 focus:ring-blue-300"
  }`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {isSelect ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={controlClassName}
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={controlClassName}
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
