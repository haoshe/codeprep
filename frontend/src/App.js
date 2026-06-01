import React, { useState, useEffect } from 'react';
import { getProblems, getDueProblems, deleteProblem, updateReview, editProblem } from './api';
import AddProblemForm, { PatternSelector, DifficultySelector, PATTERNS } from './AddProblemForm';
import supabase from './supabaseClient';
import AuthPage from './AuthPage';
import BehavioralPage from './BehavioralPage';

const getDisplayName = (session) => {
  const meta = session?.user?.user_metadata;
  return meta?.username || meta?.user_name || meta?.full_name || meta?.name || session?.user?.email?.split('@')[0] || 'User';
};

const toLeetCodeUrl = (name) => {
  const slug = name.replace(/^\d+\.\s*/, '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  return `https://leetcode.com/problems/${slug}/`;
};

const DIFFICULTY_COLORS = {
  'Brand New': 'border-purple-400 text-purple-600 hover:bg-purple-50',
  Hard: 'border-red-400 text-red-600 hover:bg-red-50',
  Medium: 'border-yellow-400 text-yellow-600 hover:bg-yellow-50',
  Easy: 'border-green-400 text-green-600 hover:bg-green-50',
  Mastered: 'border-indigo-400 text-indigo-500 hover:bg-indigo-50',
};

const DIFFICULTY_BADGE = {
  'Brand New': 'bg-purple-100 text-purple-600',
  Hard: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-600',
  Easy: 'bg-green-100 text-green-600',
  Mastered: 'bg-indigo-100 text-indigo-500',
};

function App() {
  const [session, setSession] = useState(undefined);
  const [problems, setProblems] = useState([]);
  const [dueProblems, setDueProblems] = useState([]);
  const [view, setView] = useState('problems');
  const [tab, setTab] = useState('leetcode');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [cap, setCap] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    getProblems().then(setProblems);
    getDueProblems(cap).then(setDueProblems);
  }, [cap, session]);

  const handleAdd = (newProblem) => {
    setProblems([...problems, newProblem]);
  };

  const handleDelete = async (id) => {
    await deleteProblem(id);
    setProblems(problems.filter(p => p.id !== id));
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    const cleanPattern = (p.pattern || '').split(', ').filter(pat => PATTERNS.includes(pat)).join(', ');
    setEditForm({ name: p.name, pattern: cleanPattern, difficulty: p.difficulty || 'Easy', problem_link: p.problem_link || '', solution_link: p.solution_link || '' });
  };

  const handleEditSave = async (id) => {
    const updated = await editProblem(id, editForm);
    setProblems(problems.map(p => p.id === id ? updated : p));
    setDueProblems(dueProblems.map(p => p.id === id ? updated : p));
    setEditingId(null);
  };

  const handleReview = async (id, difficulty) => {
    const updated = await updateReview(id, difficulty);
    setDueProblems(dueProblems.filter(p => p.id !== id));
    setProblems(problems.map(p => p.id === id ? updated : p));
  };

  if (session === undefined) return null;
  if (!session) return <AuthPage />;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-indigo-500">CodePrep</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('review')}
              className={`px-4 py-2 rounded font-medium ${view === 'review' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >Review {dueProblems.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2">{dueProblems.length}</span>}</button>
            <button
              onClick={() => setView('problems')}
              className={`px-4 py-2 rounded font-medium ${view === 'problems' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >My Problems</button>
            <button
              onClick={() => setView('behavioral')}
              className={`px-4 py-2 rounded font-medium ${view === 'behavioral' ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >Behavioural</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Hi, {getDisplayName(session)}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-3 py-2 rounded text-sm text-gray-500 hover:bg-gray-100"
          >Log out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">

        {view === 'review' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Review Queue</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Cap:</span>
                {[10, 20, null].map(n => (
                  <button
                    key={n ?? 'all'}
                    onClick={() => setCap(n)}
                    className={`text-sm px-3 py-1 rounded border ${cap === n ? 'bg-indigo-500 text-white border-indigo-500' : 'text-gray-600 border-gray-300 hover:border-indigo-400'}`}
                  >{n ?? 'All'}</button>
                ))}
              </div>
            </div>
            {dueProblems.length === 0 ? (
              <p className="text-gray-500">No problems due today.</p>
            ) : (
              <ul className="space-y-2">
                {dueProblems.map(p => (
                  <li key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      {p.source === 'oa' ? (
                        p.problem_link
                          ? <a href={p.problem_link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{p.name}</a>
                          : <div>{p.name}</div>
                      ) : (
                        <a href={toLeetCodeUrl(p.name)} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{p.name}</a>
                      )}
                      {p.pattern && <div className="text-xs text-gray-400 mt-0.5">{p.pattern}</div>}
                    </div>
                    <div className="flex gap-2">
                      {['Brand New', 'Hard', 'Medium', 'Easy', 'Mastered'].map(d => (
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

            <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Reviews</h2>
            {(() => {
              const days = Array.from({ length: 14 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const count = problems.filter(p => p.next_review === dateStr).length;
                const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return { dateStr, count, label };
              });
              const maxCount = Math.max(...days.map(d => d.count), 1);
              return (
                <div className="bg-white rounded shadow p-4 space-y-2">
                  {days.map(({ dateStr, count, label }) => (
                    <div key={dateStr} className="flex items-center gap-3">
                      <div className="w-28 text-sm text-gray-500 text-right shrink-0">{label}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        {count > 0 && <div className="h-4 rounded-full bg-indigo-400" style={{ width: `${(count / maxCount) * 100}%` }} />}
                      </div>
                      <div className="w-6 text-sm text-gray-600 shrink-0">{count > 0 ? count : ''}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}

        {view === 'behavioral' && <BehavioralPage />}

        {view === 'problems' && (
          <>
            <AddProblemForm onAdd={handleAdd} problems={problems} source={tab} />

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setTab('leetcode'); setPage(1); }}
                className={`px-4 py-2 rounded font-medium ${tab === 'leetcode' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >LeetCode <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === 'leetcode' ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-600'}`}>{problems.filter(p => p.source === 'leetcode').length}</span></button>
              <button
                onClick={() => { setTab('oa'); setPage(1); }}
                className={`px-4 py-2 rounded font-medium ${tab === 'oa' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >OA <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === 'oa' ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-600'}`}>{problems.filter(p => p.source === 'oa').length}</span></button>
            </div>
            {problems.filter(p => p.source === tab).length === 0 ? (
              <p className="text-gray-500">No problems yet.</p>
            ) : (
              <>
              <ul className="space-y-2">
                {problems.filter(p => p.source === tab).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(p => (
                  <li key={p.id} className="bg-white p-4 rounded shadow">
                    {editingId === p.id ? (
                      <div className="space-y-2">
                        <input className="w-full border p-2 rounded text-sm" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} placeholder="Problem name" />
                        <PatternSelector
                          selected={editForm.pattern ? editForm.pattern.split(', ').filter(Boolean) : []}
                          onChange={(patterns) => setEditForm(f => ({...f, pattern: patterns.join(', ')}))}
                        />
                        <DifficultySelector value={editForm.difficulty} onChange={(difficulty) => setEditForm(f => ({...f, difficulty}))} />
                        {tab === 'oa' && <input className="w-full border p-2 rounded text-sm" value={editForm.problem_link} onChange={e => setEditForm(f => ({...f, problem_link: e.target.value}))} placeholder="Problem link" />}
                        {tab === 'oa' && <input className="w-full border p-2 rounded text-sm" value={editForm.solution_link} onChange={e => setEditForm(f => ({...f, solution_link: e.target.value}))} placeholder="Solution link" />}
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSave(p.id)} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-100">Cancel</button>
                          <button onClick={() => { if (window.confirm('Delete this problem?')) { handleDelete(p.id); setEditingId(null); } }} className="ml-auto text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <div>
                            {p.source === 'oa' ? (
                              p.problem_link
                                ? <a href={p.problem_link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{p.name}</a>
                                : <div>{p.name}</div>
                            ) : (
                              <a href={toLeetCodeUrl(p.name)} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{p.name}</a>
                            )}
                            {p.pattern && <div className="text-xs text-gray-400 mt-0.5">{p.pattern}</div>}
                          </div>
                          <div className="flex items-center gap-4">
                            {p.difficulty && <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFFICULTY_BADGE[p.difficulty]}`}>{p.difficulty}</span>}
                            <span className="text-sm text-gray-400">Next review: {p.next_review}</span>
                            {p.source === 'oa' && (p.solution || p.solution_link) && (
                              p.solution
                                ? <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="text-sm text-gray-500 hover:text-indigo-500">
                                    {expandedId === p.id ? 'Hide Solution' : 'Solution'}
                                  </button>
                                : <a href={p.solution_link} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-indigo-500">Solution</a>
                            )}
                            <button onClick={() => handleEdit(p)} className="text-indigo-500 hover:text-indigo-600 text-sm">Edit</button>
                          </div>
                        </div>
                        {p.source === 'oa' && expandedId === p.id && p.solution && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded p-3">{p.solution}</pre>
                            {p.explanation && <p className="text-sm text-gray-500 mt-2">{p.explanation}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {(() => {
                const total = problems.filter(p => p.source === tab).length;
                const totalPages = Math.ceil(total / PAGE_SIZE);
                if (totalPages <= 1) return null;
                return (
                  <div className="flex items-center justify-between mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100">Previous</button>
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100">Next</button>
                  </div>
                );
              })()}
              </>
            )}
          </>
        )}

      </main>
    </div>
  );
}

export default App;
