import { useState } from 'react';

interface SearchBarDualProps {
  onSearch?: (primary: string, secondary: string) => void;
}

export function SearchBarDual({ onSearch }: SearchBarDualProps) {
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');

  return (
    <div className="flex gap-2">
      <input
        value={primary}
        onChange={(e) => setPrimary(e.target.value)}
        placeholder="Search..."
        className="border p-2 flex-1"
      />
      <input
        value={secondary}
        onChange={(e) => setSecondary(e.target.value)}
        placeholder="Filter..."
        className="border p-2 flex-1"
      />
      <button
        onClick={() => onSearch?.(primary, secondary)}
        className="bg-primary text-white px-4 py-2"
      >
        Go
      </button>
    </div>
  );
}
