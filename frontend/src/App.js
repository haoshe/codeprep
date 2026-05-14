import React, { useState, useEffect } from 'react';
import { getProblems, getDueProblems } from './api';

function App() {
  const [problems, setProblems] = useState([]);
  const [dueProblems, setDueProblems] = useState([]);

  useEffect(() => {
    getProblems().then(setProblems);
    getDueProblems().then(setDueProblems);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-600">CodePrep</h1>
      </nav>
      <main className="max-w-4xl mx-auto p-6">

        <h2 className="text-xl font-semibold mb-4">Today's Review Queue</h2>
        {dueProblems.length === 0 ? (
          <p className="text-gray-500 mb-8">No problems due today.</p>
        ) : (
          <ul className="mb-8 space-y-2">
            {dueProblems.map(p => (
              <li key={p.id} className="bg-white p-4 rounded shadow">
                {p.name} — {p.pattern}
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-xl font-semibold mb-4">All Problems</h2>
        {problems.length === 0 ? (
          <p className="text-gray-500">No problems yet.</p>
        ) : (
          <ul className="space-y-2">
            {problems.map(p => (
              <li key={p.id} className="bg-white p-4 rounded shadow flex justify-between">
                <span>{p.name} — {p.pattern}</span>
                <span className="text-sm text-gray-400">Next review: {p.next_review}</span>
              </li>
            ))}
          </ul>
        )}

      </main>
    </div>
  );
}

export default App;