import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/todos';

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl);
  }

  getById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`);
  }

  create(todo: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, todo);
  }

  update(id: number, changes: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}`, changes);
  }

  replace(id: number, todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.baseUrl}/${id}`, todo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
