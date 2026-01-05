'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { dsaApi } from '@/lib/api/dsa';
import { DSAProblem } from '@/types';

export default function AddProblemsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const listId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingProblems, setAddingProblems] = useState<Set<string>>(new Set());
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const results = await dsaApi.searchProblems(searchQuery.trim());
      setProblems(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search problems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (problemId: string) => {
    if (addingProblems.has(problemId)) return;

    try {
      setAddingProblems(prev => new Set(prev).add(problemId));
      await dsaApi.addProblem(listId, problemId);
      alert('Problem added to list successfully!');
    } catch (error: any) {
      console.error('Failed to add problem:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to add problem to list';
      alert(errorMessage);
    } finally {
      setAddingProblems(prev => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="text-black hover:text-blue-700 mb-6"
          >
            ← Back to List
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Problems to List</h1>

          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Problems
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Search by title, slug, or problem ID..."
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {searched && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {problems.length > 0
                  ? `Found ${problems.length} problem${problems.length !== 1 ? 's' : ''}`
                  : 'No problems found'}
              </h2>
              {problems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                  No problems found. Try a different search query.
                </div>
              ) : (
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <div key={problem._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {problem.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            ID: {problem.frontendQuestionId} • {problem.titleSlug}
                            {problem.acRate && ` • ${problem.acRate.toFixed(1)}% acceptance`}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                problem.difficulty === 'Easy'
                                  ? 'bg-green-100 text-green-800'
                                  : problem.difficulty === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                            {problem.paidOnly && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                Premium
                              </span>
                            )}
                            {problem.topicTags && problem.topicTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {problem.topicTags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                  >
                                    {tag.name || tag.slug}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddProblem(problem._id)}
                          disabled={addingProblems.has(problem._id)}
                          className="ml-4 px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingProblems.has(problem._id) ? 'Adding...' : 'Add to List'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

