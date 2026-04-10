import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { TodoService } from './services/todo.service';
import { ToastService } from './services/toast.service';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  // ================= DATA =================
  todos: Todo[] = [];
  today = new Date();

  newTask: string = '';
  searchText: string = '';
  filter: string = 'all';

  // EDIT
  editModeId: number | null = null;
  editedTask: string = '';

  // UI
  isDarkMode = false;

  // AUTH
  isLoggedIn = false;
  username = '';
  password = '';

  constructor(
    private todoService: TodoService,
    public toast: ToastService
  ) {}

  // ================= INIT =================
  ngOnInit() {
    // Restore session
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
    }

    // Restore dark mode preference
    const darkPref = localStorage.getItem('darkMode');
    if (darkPref === 'true') {
      this.isDarkMode = true;
    }

    this.loadTodos();
  }

  // ================= TOAST =================
  showToast(msg: string, isError = false) {
    this.toast.show(msg, isError);
  }

  // ================= AUTH =================
  login() {
    if (!this.username.trim() || !this.password.trim()) {
      this.showToast('Please enter username & password', true);
      return;
    }

    // NOTE: In production, replace with a real API call
    if (this.username === 'panda74' && this.password === 'Ab157421') {
      const token = 'token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', this.username);

      this.isLoggedIn = true;
      this.loadTodos();
      this.showToast('Welcome back! 🎉');
    } else {
      this.showToast('Invalid credentials', true);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.todos = [];
    this.showToast('Logged out successfully 👋');
  }

  // ================= TODO =================
  loadTodos() {
    this.todos = this.todoService.getTodos();
  }

  addTask() {
    const trimmed = this.newTask.trim();
    if (!trimmed) return;

    // Prevent duplicate tasks
    const exists = this.todos.some(t =>
      t.title.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      this.showToast('Task already exists!', true);
      return;
    }

    this.todoService.addTodo(trimmed);
    this.newTask = '';
    this.loadTodos();
    this.showToast('Task added ✅');
  }

  deleteTask(id: number) {
    this.todoService.deleteTodo(id);
    this.loadTodos();
    this.showToast('Task deleted 🗑️');
  }

  toggleTask(id: number) {
    this.todoService.toggleTodo(id);
    this.loadTodos();
  }

  clearCompleted() {
    const count = this.todos.filter(t => t.completed).length;
    this.todos.filter(t => t.completed).forEach(t => this.todoService.deleteTodo(t.id));
    this.loadTodos();
    this.showToast(`Cleared ${count} completed task(s) 🧹`);
  }

  // ================= EDIT =================
  startEdit(todo: Todo) {
    this.editModeId = todo.id;
    this.editedTask = todo.title;
  }

  saveEdit(id: number) {
    const trimmed = this.editedTask.trim();
    if (!trimmed) return;

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.title = trimmed;
      this.todoService['saveToStorage']();
    }

    this.editModeId = null;
    this.editedTask = '';
    this.showToast('Task updated ✏️');
  }

  // ================= FILTER =================
  get filteredTodos(): Todo[] {
    let list = [...this.todos];

    if (this.filter === 'done') {
      list = list.filter(t => t.completed);
    } else if (this.filter === 'pending') {
      list = list.filter(t => !t.completed);
    }

    const query = this.searchText.trim().toLowerCase();
    if (query) {
      list = list.filter(t => t.title.toLowerCase().includes(query));
    }

    return list;
  }

  // ================= PROGRESS =================
  get progressPercent(): number {
    if (this.todos.length === 0) return 0;
    return Math.round((this.todos.filter(t => t.completed).length / this.todos.length) * 100);
  }

  // ================= DRAG & DROP =================
  drop(event: any) {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
    this.todoService['saveToStorage']();
  }

  // ================= UI =================
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }
}
