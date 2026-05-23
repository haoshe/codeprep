import React, { useState, useEffect } from 'react';
import { getProblems, getDueProblems, deleteProblem, updateReview, editProblem } from './api';
import AddProblemForm from './AddProblemForm';

const toLeetCodeUrl = (name) => {
  const slug = name.replace(/^\d+\.\s*/, '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  return `https://leetcode.com/problems/${slug}/`;
};

const DIFFICULTY_COLORS = {
  Hard: 'border-red-400 text-red-600 hover:bg-red-50',
  Medium: 'border-yellow-400 text-yellow-600 hover:bg-yellow-50',
  Easy: 'border-green-400 text-green-600 hover:bg-green-50',
  Mastered: 'border-blue-400 text-blue-600 hover:bg-blue-50',
};

const DIFFICULTY_BADGE = {
  Hard: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-600',
  Easy: 'bg-green-100 text-green-600',
  Mastered: 'bg-blue-100 text-blue-600',
};

function App() {
  const [problems, setProblems] = useState([]);
  const [dueProblems, setDueProblems] = useState([]);
  const [view, setView] = useState('review');
  const [tab, setTab] = useState('leetcode');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    getProblems().then(setProblems);
    getDueProblems().then(setDueProblems);
  }, []);

  const handleAdd = (newProblem) => {
    setProblems([...problems, newProblem]);
  };

  const handleDelete = async (id) => {
    await deleteProblem(id);
    setProblems(problems.filter(p => p.id !== id));
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, pattern: p.pattern || '', difficulty: p.difficulty || 'Easy', problem_link: p.problem_link || '', solution_link: p.solution_link || '' });
  };

  const handleEditSave = async (id) => {
    const updated = await editProblem(id, editForm);
    setProblems(problems.map(p => p.id === id ? updated : p));
    setEditingId(null);
  };

  const handleReview = async (id, difficulty) => {
    const updated = await updateReview(id, difficulty);
    setDueProblems(dueProblems.filter(p => p.id !== id));
    setProblems(problems.map(p => p.id === id ? updated : p));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">CodePrep</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('review')}
            className={`px-4 py-2 rounded font-medium ${view === 'review' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >Review {dueProblems.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2">{dueProblems.length}</span>}</button>
          <button
            onClick={() => setView('problems')}
            className={`px-4 py-2 rounded font-medium ${view === 'problems' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >My Problems</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">

        {view === 'review' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Today's Review Queue</h2>
            {dueProblems.length === 0 ? (
              <p className="text-gray-500">No problems due today.</p>
            ) : (
              <ul className="space-y-2">
                {dueProblems.map(p => (
                  <li key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      {p.source === 'oa' ? (
                        p.problem_link
                          ? <a href={p.problem_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.name}</a>
                          : <div>{p.name}</div>
                      ) : (
                        <a href={toLeetCodeUrl(p.name)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.name}</a>
                      )}
                      {p.pattern && <div className="text-xs text-gray-400 mt-0.5">{p.pattern}</div>}
                    </div>
                    <div className="flex gap-2">
                      {['Hard', 'Medium', 'Easy', 'Mastered'].map(d => (
                        <button
                          key={d}
                          onClick={() => handleReview(p.id, d)}
                          className={`text-sm px-3 py-1 rounded border ${DIFFICULTY_COLORS[d]}`}
                        >{d}</button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view === 'problems' && (
          <>
            <AddProblemForm onAdd={handleAdd} problems={problems} source={tab} />

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab('leetcode')}
                className={`px-4 py-2 rounded font-medium ${tab === 'leetcode' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >LeetCode <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === 'leetcode' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{problems.filter(p => p.source === 'leetcode').length}</span></button>
              <button
                onClick={() => setTab('oa')}
                className={`px-4 py-2 rounded font-medium ${tab === 'oa' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >OA <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === 'oa' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{problems.filter(p => p.source === 'oa').length}</span></button>
            </div>
            {problems.filter(p => p.source === tab).length === 0 ? (
              <p className="text-gray-500">No problems yet.</p>
            ) : (
              <ul className="space-y-2">
                {problems.filter(p => p.source === tab).map(p => (
                  <li key={p.id} className="bg-white p-4 rounded shadow">
                    {editingId === p.id ? (
                      <div className="space-y-2">
                        <input className="w-full border p-2 rounded text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Problem name" />
                        <input className="w-full border p-2 rounded text-sm" value={editForm.pattern} onChange={e => setEditForm({...editForm, pattern: e.target.value})} placeholder="Pattern" />
                        <select className="w-full border p-2 rounded text-sm" value={editForm.difficulty} onChange={e => setEditForm({...editForm, difficulty: e.target.value})}>
                          <option>Hard</option><option>Medium</option><option>Easy</option><option>Mastered</option>
                        </select>
                        <input className="w-full border p-2 rounded text-sm" value={editForm.problem_link} onChange={e => setEditForm({...editForm, problem_link: e.target.value})} placeholder="Problem link" />
                        {tab === 'oa' && <input className="w-full border p-2 rounded text-sm" value={editForm.solution_link} onChange={e => setEditForm({...editForm, solution_link: e.target.value})} placeholder="Solution link" />}
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSave(p.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-100">Cancel</button>
                          <button onClick={() => { handleDelete(p.id); setEditingId(null); }} className="ml-auto text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          {p.source === 'oa' ? (
                            p.problem_link
                              ? <a href={p.problem_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.name}</a>
                              : <div>{p.name}</div>
                          ) : (
                            <a href={toLeetCodeUrl(p.name)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.name}</a>
                          )}
                          {p.pattern && <div className="text-xs text-gray-400 mt-0.5">{p.pattern}</div>}
                        </div>
                        <div className="flex items-center gap-4">
                          {p.difficulty && <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFFICULTY_BADGE[p.difficulty]}`}>{p.difficulty}</span>}
                          <span className="text-sm text-gray-400">Next review: {p.next_review}</span>
                          <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      </main>
    </div>
  );
}

export default App;
