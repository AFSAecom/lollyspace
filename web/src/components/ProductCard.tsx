interface Props {
  name: string;
  brand: string;
  onAdd: () => void;
}

export default function ProductCard({ name, brand, onAdd }: Props) {
  return (
    <div className="border p-2 rounded bg-background text-foreground">
      <h3 className="font-serif">{name}</h3>
      <p className="text-sm text-muted">{brand}</p>
      <button onClick={onAdd} className="mt-2 px-2 py-1 bg-primary text-background rounded">
        Add
      </button>
    </div>
  );
}
