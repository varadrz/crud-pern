'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tables')
      .then(res => res.json())
      .then(data => {
        setTables(data.map(t => t.table_name));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading tables...</div>;

  return (
    <main className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Databases Tables</h1>
      {tables.length === 0 ? (
        <p>No public tables found.</p>
      ) : (
        <ul className="space-y-4">
          {tables.map(table => (
            <li key={table} className="border p-4 rounded hover:bg-gray-50 transition">
              <Link href={`/table/${table}`} className="text-xl text-blue-600 hover:underline">
                {table}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
