import type { ProductVariant } from '@/types/product';

interface Props {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant) => void;
}

export default function VolumeButtons({ variants, onSelect }: Props) {
  return (
    <div className="flex gap-2">
      {variants.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className="px-2 py-1 border rounded"
        >
          {v.size_ml} ml - {v.price_tnd} TND
        </button>
      ))}
    </div>
  );
}
