export default function Input({ type, placeholder, value, onChange, className }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`p-2 rounded bg-gray-800 text-white w-full ${className}`}
      />
    );
  }
  