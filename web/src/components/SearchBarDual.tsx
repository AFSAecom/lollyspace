interface Props {
  onSearch: (value: string) => void;
}

export default function SearchBarDual({ onSearch }: Props) {
  return (
    <input
      type="text"
      placeholder="Search"
      className="w-full p-2 border rounded"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
