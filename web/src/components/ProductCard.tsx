interface ProductCardProps {
  title: string;
  description: string;
  price: string;
}

export function ProductCard({ title, description, price }: ProductCardProps) {
  return (
    <div className="border rounded p-4 shadow">
      <h3 className="text-lg font-heading">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-2 font-bold">{price}</div>
    </div>
  );
}
