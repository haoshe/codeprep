const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const getProblems = async () => {
  const res = await fetch(`${BASE_URL}/problems`);
  return res.json();
};

export const getDueProblems = async () => {
  const res = await fetch(`${BASE_URL}/problems/due`);
  return res.json();
};

export const createProblem = async (problem) => {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problem),
  });
  return res.json();
};

export const updateReview = async (id, difficulty) => {
  const res = await fetch(`${BASE_URL}/problems/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });
  return res.json();
};

export const deleteProblem = async (id) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const searchProblems = async (q) => {
  const res = await fetch(`${BASE_URL}/problems/search?q=${q}`);
  return res.json();
};