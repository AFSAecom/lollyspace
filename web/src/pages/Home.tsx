import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 50 },
  { name: 'Mar', value: 40 },
];

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl mb-4">Home Page</h2>
      <LineChart width={300} height={100} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
