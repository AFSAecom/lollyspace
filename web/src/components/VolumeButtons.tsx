interface Variant {
  id: number;
  volume_ml: number;
  price_tnd: number;
}

interface Props {
  variants: Variant[];
  onSelect: (variant: Variant) => void;
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
          {v.volume_ml} ml - {v.price_tnd} TND
        </button>
      ))}
    </div>
  );
}
