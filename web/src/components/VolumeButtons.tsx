import { useVolumeStore } from '@/store/volume';

export function VolumeButtons() {
  const { volume, increase, decrease } = useVolumeStore();

  return (
    <div className="flex items-center gap-2">
      <button onClick={decrease} className="px-2 py-1 border rounded">-</button>
      <span>{volume}</span>
      <button onClick={increase} className="px-2 py-1 border rounded">+</button>
    </div>
  );
}
