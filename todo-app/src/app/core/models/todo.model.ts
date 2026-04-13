export type TodoStatus = 'active' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  category: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface TodoFilter {
  status: TodoStatus | 'all';
  priority: Priority | 'all';
  category: string;
  search: string;
}

export const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
