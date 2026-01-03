'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { dsaApi } from '@/lib/api/dsa';
import { DSAList } from '@/types';
import Link from 'next/link';

export default function DSAPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [lists, setLists] = useState<DSAList[]>([]);
  const [publicLists, setPublicLists] = useState<DSAList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadLists();
  }, [isAuthenticated, router]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const [myLists, pubLists] = await Promise.all([
        dsaApi.getMyLists(),
        dsaApi.getPublicLists(),
      ]);
      setLists(myLists);
      setPublicLists(pubLists);
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const newList = await dsaApi.createList(newListName, isPublic);
      setLists([...lists, newList]);
      setNewListName('');
      setIsPublic(false);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create list:', error);
      alert('Failed to create list');
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      await dsaApi.deleteList(id);
      setLists(lists.filter(list => list._id !== id));
    } catch (error) {
      console.error('Failed to delete list:', error);
      alert('Failed to delete list');
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">DSA Lists</h1>
            <div className="flex space-x-4">
              <Link
                href="/dsa/search"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700"
              >
                Search by Company
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-black"
              >
                Create List
              </button>
            </div>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateList} className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter list name"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this list public
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                      setIsPublic(false);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('my')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Lists
                </button>
                <button
                  onClick={() => setActiveTab('public')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'public'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Public Lists
                </button>
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(activeTab === 'my' ? lists : publicLists).map((list) => (
                <div key={list._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Link href={`/dsa/lists/${list._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-black cursor-pointer">
                        {list.name}
                      </h3>
                    </Link>
                    {list.isPublic && (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                        Public
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {list.problemIds.length} problem{list.problemIds.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dsa/lists/${list._id}`}
                      className="flex-1 text-center px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      View
                    </Link>
                    {activeTab === 'my' && (
                      <button
                        onClick={() => handleDeleteList(list._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(activeTab === 'my' ? lists : publicLists).length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No lists found. {activeTab === 'my' ? 'Create your first list!' : 'No public lists available.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

