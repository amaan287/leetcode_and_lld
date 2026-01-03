'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { lldApi } from '@/lib/api/lld';
import { LLDQuestion, LLDAnswer } from '@/types';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const questionId = params.id as string;
  const [question, setQuestion] = useState<LLDQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState<LLDAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadQuestion();
  }, [questionId, isAuthenticated, router]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await lldApi.getQuestion(questionId);
      setQuestion(data);
    } catch (error: any) {
      console.error('Failed to load question:', error);
      if (error.response?.status === 404) {
        alert('Question not found');
        router.push('/lld');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      setSubmitting(true);
      const result = await lldApi.submitAnswer(questionId, answer);
      setSubmittedAnswer(result);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated() || loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!question) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Question not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="text-black hover:text-blue-700 mb-6"
          >
            ← Back to Questions
          </button>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  question.difficulty === 'Easy'
                    ? 'bg-green-100 text-green-800'
                    : question.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {question.difficulty}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {question.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Scenario</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{question.scenario}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{question.description}</p>
            </div>
          </div>

          {!submittedAnswer ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Solution</h2>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 min-h-[300px] font-mono text-sm"
                placeholder="Write your solution here..."
                required
              />
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className="w-full px-6 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for Rating'}
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Solution</h2>
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{submittedAnswer.answer}</pre>
              </div>

              {submittedAnswer.rating && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-black">{submittedAnswer.rating}</div>
                    <div className="text-gray-500">out of 10</div>
                  </div>
                </div>
              )}

              {submittedAnswer.feedback && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submittedAnswer.feedback}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSubmittedAnswer(null);
                  setAnswer('');
                }}
                className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Submit New Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

