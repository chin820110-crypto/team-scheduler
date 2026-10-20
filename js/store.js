// js/store.js - LocalStorage 存取與全域狀態管理

import { DEFAULT_MEMBERS, generateDefaultShifts, generateDefaultTasks } from './data.js';

const STORAGE_KEYS = {
  MEMBERS: 'team_scheduler_members_v1',
  SHIFTS: 'team_scheduler_shifts_v1',
  TASKS: 'team_scheduler_tasks_v1'
};

class Store {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // 檢查並初始化成員資料
    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!rawMembers) {
      this.members = [...DEFAULT_MEMBERS];
      this.saveMembers();
    } else {
      try {
        this.members = JSON.parse(rawMembers);
        // 確保 5 位成員都在
        if (!Array.isArray(this.members) || this.members.length === 0) {
          this.members = [...DEFAULT_MEMBERS];
          this.saveMembers();
        }
      } catch (e) {
        this.members = [...DEFAULT_MEMBERS];
        this.saveMembers();
      }
    }

    // 檢查並初始化排班資料
    const rawShifts = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (!rawShifts) {
      this.shifts = generateDefaultShifts();
      this.saveShifts();
    } else {
      try {
        this.shifts = JSON.parse(rawShifts) || [];
      } catch (e) {
        this.shifts = generateDefaultShifts();
        this.saveShifts();
      }
    }

    // 檢查並初始化任務資料
    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!rawTasks) {
      this.tasks = generateDefaultTasks();
      this.saveTasks();
    } else {
      try {
        this.tasks = JSON.parse(rawTasks) || [];
      } catch (e) {
        this.tasks = generateDefaultTasks();
        this.saveTasks();
      }
    }
  }

  // 狀態監聽
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  // 儲存方法
  saveMembers() {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));
  }

  saveShifts() {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(this.shifts));
  }

  saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
  }

  // 成員方法
  getMembers() {
    return this.members;
  }

  getMemberById(id) {
    return this.members.find(m => m.id === id);
  }

  // 排班方法
  getShifts() {
    return this.shifts;
  }

  getShift(memberId, dateStr) {
    return this.shifts.find(s => s.memberId === memberId && s.date === dateStr);
  }

  setShift(memberId, dateStr, shiftType, note = '') {
    const existingIndex = this.shifts.findIndex(s => s.memberId === memberId && s.date === dateStr);
    if (existingIndex >= 0) {
      this.shifts[existingIndex].shiftType = shiftType;
      this.shifts[existingIndex].note = note;
    } else {
      this.shifts.push({
        id: `shift_${memberId}_${dateStr}`,
        memberId,
        date: dateStr,
        shiftType,
        note
      });
    }
    this.saveShifts();
    this.notify();
  }

  // 任務方法
  getTasks() {
    return this.tasks;
  }

  addTask(taskData) {
    const newTask = {
      id: 't-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : '',
      assigneeId: taskData.assigneeId,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      status: taskData.status || 'todo',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.tasks.unshift(newTask);
    this.saveTasks();
    this.notify();
    return newTask;
  }

  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates
      };
      this.saveTasks();
      this.notify();
      return this.tasks[taskIndex];
    }
    return null;
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasks();
    this.notify();
  }

  // 重設為預設資料
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    this.init();
    this.notify();
  }
}

export const store = new Store();
