import React, { useState, useEffect } from 'react';
import { getBehavioral, createBehavioral, updateBehavioral, deleteBehavioral } from './api';

const PREDEFINED = [
  "Tell me about a time you faced a significant challenge and how you overcame it.",
  "Describe a situation where you worked effectively as part of a team.",
  "Tell me about a time you demonstrated leadership.",
  "Give an example of when you had to deal with a difficult team member.",
  "Tell me about a time you made a mistake and how you handled it.",
  "Describe a situation where you had to meet a tight deadline.",
  "Tell me about a time you went above and beyond what was expected.",
  "Give an example of when you had to adapt to a significant change.",
  "Tell me about a time you had to learn something new quickly.",
  "Describe a situation where you had to prioritize competing tasks.",
  "Tell me about a time you disagreed with a decision and what you did.",
  "Give an example of a project you are most proud of.",
  "Tell me about a time you received critical feedback and how you responded.",
  "Describe a situation where you had to persuade someone to see your point of view.",
  "Tell me about a time you failed and what you learned from it.",
  "Give an example of when you showed initiative without being asked.",
  "Tell me about a time you had to work with limited resources.",
  "Describe a situation where you resolved a conflict within a team.",
  "Tell me about a time you had to deal with ambiguity or unclear requirements.",
  "How do you handle stress and pressure? Give a specific example.",
];

function QuestionCard({ question, entry, isCustom, expandedQ, setExpandedQ, draft, setDraft, onSave, onDelete, saving }) {
  const isOpen = expandedQ === question;
  const hasAnswer = entry?.answer;

  return (
    <div className="bg-white rounded shadow border-l-4 border-indigo-400">
      <button
        onClick={() => setExpandedQ(isOpen ? null : question)}
        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-indigo-50 rounded"
      >
        <span className="text-sm font-medium text-indigo-700 pr-4">{question}</span>
        <div className="flex items-center gap-2 shrink-0">
          {hasAnswer && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Answered</span>}
          <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <textarea
            rows={6}
            className="w-full border border-gray-300 rounded p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
            placeholder="Write your answer using the STAR method (Situation, Task, Action, Result)..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(question, isCustom)}
              disabled={saving === question}
              className="bg-indigo-500 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-600 disabled:opacity-50"
            >{saving === question ? 'Saving...' : 'Save'}</button>
            {isCustom && entry && (
              <button
                onClick={() => { if (window.confirm('Delete this question?')) onDelete(question); }}
                className="text-red-400 hover:text-red-600 text-sm ml-auto"
              >Delete</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BehavioralPage() {
  const [entries, setEntries] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    getBehavioral().then(setEntries);
  }, []);

  const entryFor = (question) => entries.find(e => e.question === question);

  const handleToggle = (question) => {
    if (expandedQ === question) {
      setExpandedQ(null);
      return;
    }
    setExpandedQ(question);
    const entry = entryFor(question);
    if (drafts[question] === undefined) {
      setDrafts(d => ({ ...d, [question]: entry?.answer || '' }));
    }
  };

  const handleSave = async (question, isCustom = false) => {
    setSaving(question);
    const entry = entryFor(question);
    const answer = drafts[question] || '';
    let updated;
    if (entry) {
      updated = await updateBehavioral(entry.id, answer);
      setEntries(entries.map(e => e.id === updated.id ? updated : e));
    } else {
      updated = await createBehavioral({ question, answer, is_custom: isCustom });
      setEntries([...entries, updated]);
    }
    setSaving(null);
  };

  const handleDelete = async (question) => {
    const entry = entryFor(question);
    if (!entry) return;
    await deleteBehavioral(entry.id);
    setEntries(entries.filter(e => e.id !== entry.id));
    setExpandedQ(null);
  };

  const handleAddCustom = async () => {
    if (!newQuestion.trim()) return;
    const created = await createBehavioral({ question: newQuestion.trim(), answer: '', is_custom: true });
    setEntries([...entries, created]);
    setNewQuestion('');
    setAddingCustom(false);
    setExpandedQ(created.question);
    setDrafts(d => ({ ...d, [created.question]: '' }));
  };

  const customEntries = entries.filter(e => e.is_custom);
  const allQuestions = [...PREDEFINED, ...customEntries.map(e => e.question)];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Behavioural Questions</h2>
          <p className="text-sm text-gray-400 mt-0.5">{entries.filter(e => e.answer).length} of {allQuestions.length} answered</p>
        </div>
        <button
          onClick={() => setAddingCustom(true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded text-sm hover:bg-indigo-600"
        >+ Add Question</button>
      </div>

      {addingCustom && (
        <div className="bg-white rounded shadow p-4 mb-4 space-y-3">
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter your custom behavioural question..."
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleAddCustom} className="bg-indigo-500 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-600">Add</button>
            <button onClick={() => { setAddingCustom(false); setNewQuestion(''); }} className="text-gray-500 px-4 py-1.5 rounded text-sm hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      {customEntries.length > 0 && (
        <>
          <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">My Questions</h3>
          <div className="space-y-2 mb-6">
            {customEntries.map(e => (
              <QuestionCard
                key={e.question}
                question={e.question}
                entry={entryFor(e.question)}
                isCustom
                expandedQ={expandedQ}
                setExpandedQ={handleToggle}
                draft={drafts[e.question] ?? e.answer ?? ''}
                setDraft={val => setDrafts(d => ({ ...d, [e.question]: val }))}
                onSave={handleSave}
                onDelete={handleDelete}
                saving={saving}
              />
            ))}
          </div>
        </>
      )}

      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Common Questions</h3>
      <div className="space-y-2">
        {PREDEFINED.map(q => (
          <QuestionCard
            key={q}
            question={q}
            entry={entryFor(q)}
            isCustom={false}
            expandedQ={expandedQ}
            setExpandedQ={handleToggle}
            draft={drafts[q] ?? entryFor(q)?.answer ?? ''}
            setDraft={val => setDrafts(d => ({ ...d, [q]: val }))}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
}
