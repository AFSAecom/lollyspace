import VolumeButtons from './VolumeButtons';
import type { ProductVariant } from '@/types/product';

interface Props {
  name: string;
  brand: string;
  variants: ProductVariant[];
  onAdd: (variant: ProductVariant) => void;
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
