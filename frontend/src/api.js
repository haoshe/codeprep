import supabase from './supabaseClient';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const authHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  };
};

export const getProblems = async () => {
  const res = await fetch(`${BASE_URL}/problems`, { headers: await authHeaders() });
  return res.json();
};

export const getDueProblems = async (limit = null) => {
  const url = limit ? `${BASE_URL}/problems/due?limit=${limit}` : `${BASE_URL}/problems/due`;
  const res = await fetch(url, { headers: await authHeaders() });
  return res.json();
};

export const createProblem = async (problem) => {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(problem),
  });
  return res.json();
};

export const updateReview = async (id, difficulty) => {
  const res = await fetch(`${BASE_URL}/problems/${id}/review`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ difficulty }),
  });
  return res.json();
};

export const deleteProblem = async (id) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return res.json();
};

export const editProblem = async (id, data) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const searchProblems = async (q) => {
  const res = await fetch(`${BASE_URL}/problems/search?q=${q}`, { headers: await authHeaders() });
  return res.json();
};

export const getBehavioral = async () => {
  const res = await fetch(`${BASE_URL}/behavioral`, { headers: await authHeaders() });
  return res.json();
};

export const createBehavioral = async (data) => {
  const res = await fetch(`${BASE_URL}/behavioral`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateBehavioral = async (id, fields) => {
  const res = await fetch(`${BASE_URL}/behavioral/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(fields),
  });
  return res.json();
};

export const deleteBehavioral = async (id) => {
  const res = await fetch(`${BASE_URL}/behavioral/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return res.json();
};
