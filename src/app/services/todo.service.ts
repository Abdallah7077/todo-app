import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {

  private todos: Todo[] = [];

  constructor() {
    this.loadFromStorage();
  }

  getTodos(): Todo[] {
    return this.todos;
  }

  addTodo(title: string) {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
    };

    this.todos.push(newTodo);
    this.saveToStorage();
  }

  deleteTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToStorage();
  }

  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  private loadFromStorage() {
    const data = localStorage.getItem('todos');
    if (data) {
      this.todos = JSON.parse(data);
    }
  }
}
