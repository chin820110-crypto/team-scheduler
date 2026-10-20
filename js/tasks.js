// js/tasks.js - 任務指派、看板渲染、狀態切換與管理

import { store } from './store.js';
import { TASK_STATUSES, TASK_PRIORITIES } from './data.js';

export class TaskManager {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.filters = {
      assigneeId: 'all',
      status: 'all',
      search: ''
    };
    this.init();
  }

  init() {
    this.setupNewTaskModal();
    this.setupFilters();
    this.render();
  }

  setupFilters() {
    const memberSelect = document.getElementById('filterAssigneeSelect');
    const statusSelect = document.getElementById('filterStatusSelect');
    const searchInput = document.getElementById('searchTaskInput');

    // 填充成員篩選下拉選單
    if (memberSelect) {
      const members = store.getMembers();
      memberSelect.innerHTML = `<option value="all">全部成員</option>` +
        members.map(m => `<option value="${m.id}">${m.avatar} ${m.name}</option>`).join('');

      memberSelect.addEventListener('change', (e) => {
        this.filters.assigneeId = e.target.value;
        this.render();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.render();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase().trim();
        this.render();
      });
    }
  }

  setupNewTaskModal() {
    const modal = document.getElementById('taskModal');
    if (!modal) return;

    const openBtn = document.getElementById('openNewTaskModalBtn');
    const closeBtn = document.getElementById('closeTaskModalBtn');
    const cancelBtn = document.getElementById('cancelTaskModalBtn');
    const form = document.getElementById('taskForm');
    const assigneeSelect = document.getElementById('taskAssigneeSelect');

    // 填入指派成員下拉清單（5 位預設成員）
    if (assigneeSelect) {
      const members = store.getMembers();
      assigneeSelect.innerHTML = members.map(m => `
        <option value="${m.id}">${m.avatar} ${m.name} - ${m.role}</option>
      `).join('');
    }

    const openModal = () => {
      form.reset();
      // 預設日期為明天
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateInput = document.getElementById('taskDueDateInput');
      if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];

      modal.classList.remove('hidden');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
    };

    if (openBtn) openBtn.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('taskTitleInput').value;
        const description = document.getElementById('taskDescInput').value;
        const assigneeId = document.getElementById('taskAssigneeSelect').value;
        const priority = document.getElementById('taskPrioritySelect').value;
        const dueDate = document.getElementById('taskDueDateInput').value;
        const status = document.getElementById('taskStatusSelect').value;

        if (!title.trim()) {
          alert('請輸入任務名稱！');
          return;
        }

        store.addTask({
          title,
          description,
          assigneeId,
          priority,
          dueDate,
          status
        });

        closeModal();
        if (this.options.onTaskChanged) {
          this.options.onTaskChanged();
        }
      };
    }
  }

  // 取得篩選後的任務列表
  getFilteredTasks() {
    return store.getTasks().filter(task => {
      // 成員篩選
      if (this.filters.assigneeId !== 'all' && task.assigneeId !== this.filters.assigneeId) {
        return false;
      }
      // 狀態篩選
      if (this.filters.status !== 'all' && task.status !== this.filters.status) {
        return false;
      }
      // 關鍵字搜尋
      if (this.filters.search) {
        const query = this.filters.search;
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        const member = store.getMemberById(task.assigneeId);
        const memberMatch = member ? member.name.toLowerCase().includes(query) : false;
        if (!titleMatch && !descMatch && !memberMatch) return false;
      }
      return true;
    });
  }

  render() {
    if (!this.container) return;

    const filteredTasks = this.getFilteredTasks();

    // 按照看板 3 欄進行分組
    const columns = [
      { id: 'todo', title: '待辦事項', icon: '📝', color: 'border-amber-400 bg-amber-50/50 text-amber-800' },
      { id: 'in_progress', title: '進行中', icon: '⚡', color: 'border-blue-400 bg-blue-50/50 text-blue-800' },
      { id: 'done', title: '已完成', icon: '✅', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800' }
    ];

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    `;

    columns.forEach(col => {
      const colTasks = filteredTasks.filter(t => t.status === col.id);

      html += `
        <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col min-h-[480px]">
          <!-- 看板欄位標頭 -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="text-lg">${col.icon}</span>
              <h3 class="font-bold text-slate-800">${col.title}</h3>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${col.color}">
              ${colTasks.length}
            </span>
          </div>

          <!-- 任務卡片容器 -->
          <div class="flex-1 space-y-3 overflow-y-auto pr-1">
            ${colTasks.length === 0 ? `
              <div class="h-36 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                <span>目前無此狀態任務</span>
              </div>
            ` : ''}

            ${colTasks.map(task => {
              const member = store.getMemberById(task.assigneeId) || { name: '未指派', role: '', avatar: '👤' };
              const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium;
              const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date(new Date().toDateString());

              return `
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md border ${priority.color}">
                        優先級: ${priority.label}
                      </span>
                      <button 
                        type="button"
                        data-delete-id="${task.id}"
                        class="delete-task-btn text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="刪除任務"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>

                    <h4 class="font-bold text-slate-900 text-sm mb-1 line-clamp-2">${task.title}</h4>
                    ${task.description ? `
                      <p class="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">${task.description}</p>
                    ` : ''}
                  </div>

                  <!-- 卡片底部：負責人、到期日與切換狀態按鈕 -->
                  <div class="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2.5">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-1.5" title="指派成員">
                        <span class="text-base">${member.avatar}</span>
                        <span class="font-medium text-slate-700">${member.name}</span>
                      </div>
                      <div class="flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>${task.dueDate}</span>
                      </div>
                    </div>

                    <!-- 狀態切換快速按鈕 -->
                    <div class="flex items-center gap-1 pt-1">
                      <span class="text-[10px] text-slate-400 mr-1">狀態切換:</span>
                      ${col.id !== 'todo' ? `
                        <button type="button" data-task-id="${task.id}" data-new-status="todo" class="change-status-btn flex-1 py-1 px-1.5 text-[11px] rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors">
                          待辦
                        </button>
                      ` : ''}
                      ${col.id !== 'in_progress' ? `
                        <button type="button" data-task-id="${task.id}" data-new-status="in_progress" class="change-status-btn flex-1 py-1 px-1.5 text-[11px] rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors">
                          進行中
                        </button>
                      ` : ''}
                      ${col.id !== 'done' ? `
                        <button type="button" data-task-id="${task.id}" data-new-status="done" class="change-status-btn flex-1 py-1 px-1.5 text-[11px] rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors">
                          已完成
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    this.container.innerHTML = html;

    // 綁定狀態切換按鈕事件
    this.container.querySelectorAll('.change-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        const newStatus = btn.getAttribute('data-new-status');
        store.updateTask(taskId, { status: newStatus });
        if (this.options.onTaskChanged) {
          this.options.onTaskChanged();
        }
      });
    });

    // 綁定刪除任務按鈕事件
    this.container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-delete-id');
        if (confirm('確定要刪除這筆任務嗎？')) {
          store.deleteTask(taskId);
          if (this.options.onTaskChanged) {
            this.options.onTaskChanged();
          }
        }
      });
    });
  }
}
