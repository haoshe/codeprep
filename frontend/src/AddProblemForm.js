import React, { useState } from 'react';
import { createProblem } from './api';

export const PATTERNS = [
  'Array', 'Hash Map', 'Two Pointers', 'Sliding Window', 'Binary Search',
  'Stack', 'Queue', 'Linked List', 'Tree', 'Graph', 'DFS', 'BFS',
  'Dynamic Programming', 'Greedy', 'Backtracking', 'Heap', 'Trie',
  'Sorting', 'Math', 'String', 'Bit Manipulation', 'Union Find', 'Monotonic Stack', 'Simulation', 'Difference Array', 'Matrix Manipulation',
  'KMP', 'Bellman-Ford', 'Boyer-Moore', 'Morris Traversal',
];

const DIFFICULTY_STYLES = {
  'Brand New': { active: 'bg-purple-500 text-white border-purple-500', inactive: 'text-purple-500 border-purple-300 hover:border-purple-500' },
  Hard: { active: 'bg-red-500 text-white border-red-500', inactive: 'text-red-500 border-red-300 hover:border-red-500' },
  Medium: { active: 'bg-yellow-500 text-white border-yellow-500', inactive: 'text-yellow-500 border-yellow-300 hover:border-yellow-500' },
  Easy: { active: 'bg-green-500 text-white border-green-500', inactive: 'text-green-500 border-green-300 hover:border-green-500' },
  Mastered: { active: 'bg-indigo-500 text-white border-indigo-500', inactive: 'text-indigo-500 border-indigo-300 hover:border-indigo-500' },
};

export function DifficultySelector({ value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Difficulty</p>
      <div className="flex gap-2">
        {Object.keys(DIFFICULTY_STYLES).map(d => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`text-sm px-4 py-1 rounded-full border ${value === d ? DIFFICULTY_STYLES[d].active : DIFFICULTY_STYLES[d].inactive}`}
          >{d}</button>
        ))}
      </div>
    </div>
  );
}

export function PatternSelector({ selected, onChange }) {
  const toggle = (p) => {
    onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]);
  };
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Patterns</p>
      <div className="flex flex-wrap gap-2">
        {PATTERNS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={`text-sm px-3 py-1 rounded-full border ${selected.includes(p) ? 'bg-indigo-500 text-white border-indigo-500' : 'text-gray-600 border-gray-300 hover:border-indigo-400'}`}
          >{p}</button>
        ))}
      </div>
    </div>
  );
}

function AddProblemForm({ onAdd, problems = [], source }) {
  const [form, setForm] = useState({
    name: '',
    selectedPatterns: [],
    difficulty: 'Easy',
    problem_link: '',
    solution_link: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedName = form.name.trim();
    const duplicate = problems.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
      setError('Problem already exists');
      return;
    }
    const result = await createProblem({
      name: trimmedName,
      pattern: form.selectedPatterns.join(', '),
      difficulty: form.difficulty,
      problem_link: form.problem_link,
      solution_link: form.solution_link,
      source,
    });
    if (result.detail) {
      setError(result.detail);
      return;
    }
    onAdd(result);
    setForm({ name: '', selectedPatterns: [], difficulty: 'Easy', problem_link: '', solution_link: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4">
      <h2 className="text-xl font-semibold">Add {source === 'oa' ? 'OA' : 'LeetCode'} Problem</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input className="w-full border p-2 rounded" placeholder="Problem name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
      <PatternSelector
        selected={form.selectedPatterns}
        onChange={(selectedPatterns) => setForm(f => ({...f, selectedPatterns}))}
      />
      <DifficultySelector value={form.difficulty} onChange={(difficulty) => setForm(f => ({...f, difficulty}))} />
      {source === 'oa' && <input className="w-full border p-2 rounded" placeholder="Problem link" value={form.problem_link} onChange={e => setForm(f => ({...f, problem_link: e.target.value}))} />}
      {source === 'oa' && <input className="w-full border p-2 rounded" placeholder="Solution link" value={form.solution_link} onChange={e => setForm(f => ({...f, solution_link: e.target.value}))} />}
      <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Add Problem</button>
    </form>
  );
}

export default AddProblemForm;
