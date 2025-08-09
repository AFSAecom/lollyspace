import { ProductCard } from '@/components/ProductCard';
import { SearchBarDual } from '@/components/SearchBarDual';
import { VolumeButtons } from '@/components/VolumeButtons';

export default function Client() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Client Page</h2>
      <SearchBarDual />
      <ProductCard title="Sample Product" description="Demo item" price="$19.99" />
      <VolumeButtons />
    </div>
  );
}
