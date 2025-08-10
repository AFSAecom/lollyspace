import { useEffect, useState } from 'react';

interface Props {
  onSearch: (params: { q_brand_name: string; q_ingredients: string }) => void;
}

export default function SearchBarDual({ onSearch }: Props) {
  const [brandName, setBrandName] = useState('');
  const [ingredients, setIngredients] = useState('');

  useEffect(() => {
    onSearch({ q_brand_name: brandName, q_ingredients: ingredients });
  }, [brandName, ingredients, onSearch]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Marque ou nom"
        className="w-full p-2 border rounded"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ingrédients"
        className="w-full p-2 border rounded"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
    </div>
  );
}
