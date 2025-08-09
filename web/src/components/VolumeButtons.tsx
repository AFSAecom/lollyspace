interface Props {
  volumes: number[];
  onSelect: (volume: number) => void;
}

export default function VolumeButtons({ volumes, onSelect }: Props) {
  return (
    <div className="flex gap-2">
      {volumes.map((v) => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className="px-2 py-1 border rounded"
        >
          {v} ml
        </button>
      ))}
    </div>
  );
}
