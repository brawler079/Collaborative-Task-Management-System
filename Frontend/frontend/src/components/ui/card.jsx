export function Card({ children, className }) {
  return <div className={`p-4 bg-gray-900 border border-gray-700 rounded-lg ${className}`}>{children}</div>;
}
export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
export function CardHeader({ children }) {
  return <div className="mb-2 text-lg font-semibold">{children}</div>;
}
export function CardTitle({ children }) {
  return <h2 className="text-xl">{children}</h2>;
}
