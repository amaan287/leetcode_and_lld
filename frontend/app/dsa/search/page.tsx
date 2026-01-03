'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { dsaApi } from '@/lib/api/dsa';
import { DSAProblem } from '@/types';

export default function CompanySearchPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('SDE');
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isAuthenticated()) {
    router.push('/auth/login');
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const results = await dsaApi.searchByCompany(companyName, role);
      setProblems(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="text-blackver:text-blue-700 mb-6"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Problems by Company</h1>

          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Google, Amazon, Microsoft"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., SDE, SWE"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searched && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Top {problems.length} Problems for {companyName} {role}
              </h2>
              {problems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No problems found. Try a different company or role.
                </div>
              ) : (
                <div className="space-y-4">
                  {problems.map((problem, index) => (
                    <div key={problem._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
                          </div>
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
                                {problem.topicTags.map((tag, idx) => (
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

