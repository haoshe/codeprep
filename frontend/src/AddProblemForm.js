import React, { useState } from 'react';
import { createProblem } from './api';

function AddProblemForm({ onAdd, problems = [], source }) {
  const [form, setForm] = useState({
    name: '',
    pattern: '',
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
    const result = await createProblem({ ...form, name: trimmedName, source });
    if (result.detail) {
      setError(result.detail);
      return;
    }
    onAdd(result);
    setForm({ name: '', pattern: '', difficulty: 'Easy', problem_link: '', solution_link: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4">
      <h2 className="text-xl font-semibold">Add {source === 'oa' ? 'OA' : 'LeetCode'} Problem</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input className="w-full border p-2 rounded" placeholder="Problem name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <input className="w-full border p-2 rounded" placeholder="Pattern (e.g. Hash Map)" value={form.pattern} onChange={e => setForm({...form, pattern: e.target.value})} />
      <select className="w-full border p-2 rounded" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
        <option>Hard</option>
        <option>Medium</option>
        <option>Easy</option>
        <option>Mastered</option>
      </select>
      {source === 'oa' && <input className="w-full border p-2 rounded" placeholder="Problem link" value={form.problem_link} onChange={e => setForm({...form, problem_link: e.target.value})} />}
      {source === 'oa' && <input className="w-full border p-2 rounded" placeholder="Solution link" value={form.solution_link} onChange={e => setForm({...form, solution_link: e.target.value})} />}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Problem</button>
    </form>
  );
}

export default AddProblemForm;
