import { apiClient } from './client';
import { DSAList, DSAProblem, ListWithProblems } from '@/types';

export const dsaApi = {
  createList: async (name: string, isPublic: boolean = false): Promise<DSAList> => {
    const response = await apiClient.post<DSAList>('/dsa/lists', { name, isPublic });
    return response.data;
  },

  getMyLists: async (): Promise<DSAList[]> => {
    const response = await apiClient.get<DSAList[]>('/dsa/lists');
    return response.data;
  },

  getPublicLists: async (): Promise<DSAList[]> => {
    const response = await apiClient.get<DSAList[]>('/dsa/lists/public');
    return response.data;
  },

  getList: async (id: string): Promise<ListWithProblems> => {
    const response = await apiClient.get<ListWithProblems>(`/dsa/lists/${id}`);
    return response.data;
  },

  updateList: async (id: string, updates: { name?: string; isPublic?: boolean }): Promise<DSAList> => {
    const response = await apiClient.put<DSAList>(`/dsa/lists/${id}`, updates);
    return response.data;
  },

  deleteList: async (id: string): Promise<void> => {
    await apiClient.delete(`/dsa/lists/${id}`);
  },

  addProblem: async (listId: string, problemId: string): Promise<void> => {
    await apiClient.post(`/dsa/lists/${listId}/problems`, { problemId });
  },

  removeProblem: async (listId: string, problemId: string): Promise<void> => {
    await apiClient.delete(`/dsa/lists/${listId}/problems/${problemId}`);
  },

  toggleProblemStatus: async (listId: string, problemId: string, isCompleted: boolean): Promise<void> => {
    await apiClient.post(`/dsa/lists/${listId}/problems/${problemId}/toggle`, { isCompleted });
  },

  searchByCompany: async (companyName: string, role: string = 'SDE'): Promise<DSAProblem[]> => {
    const response = await apiClient.post<DSAProblem[]>('/dsa/search/company', {
      companyName,
      role,
    });
    return response.data;
  },
};

