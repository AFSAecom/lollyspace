import ProductCard from '../components/ProductCard';
import SearchBarDual from '../components/SearchBarDual';

export default function Client() {
  return (
    <div className="space-y-4">
      <SearchBarDual onSearch={() => {}} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard name="Sample" brand="Brand" onAdd={() => {}} />
      </div>
    </div>
  );
}
