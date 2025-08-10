import { useEffect, useState } from 'react';

interface Props {
  onSearch: (params: { query_name_brand: string; query_notes: string }) => void;
}

export default function SearchBarDual({ onSearch }: Props) {
  const [nameBrand, setNameBrand] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    onSearch({ query_name_brand: nameBrand, query_notes: notes });
  }, [nameBrand, notes, onSearch]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Nom ou marque"
        className="w-full p-2 border rounded"
        value={nameBrand}
        onChange={(e) => setNameBrand(e.target.value)}
      />
      <input
        type="text"
        placeholder="Notes ou famille"
        className="w-full p-2 border rounded"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
}
