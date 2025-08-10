import VolumeButtons from './VolumeButtons';

interface Variant {
  id: number;
  volume_ml: number;
  price_tnd: number;
}

interface Props {
  name: string;
  brand: string;
  variants: Variant[];
  onAdd: (variant: Variant) => void;
}

export default function ProductCard({ name, brand, variants, onAdd }: Props) {
  return (
    <div className="border p-2 rounded bg-background text-foreground">
      <h3 className="font-serif">{name}</h3>
      <p className="text-sm text-muted">{brand}</p>
      <div className="mt-2">
        <VolumeButtons variants={variants} onSelect={onAdd} />
      </div>
    </div>
  );
}
