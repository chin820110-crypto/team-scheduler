// js/bundle.js - 團隊排班與任務管理 Dashboard 完整前端邏輯 (相容 file:// 協定與 http://)

(() => {
  // ==========================================
  // 1. 預設資料與設定 (Data & Config)
  // ==========================================
  const DEFAULT_MEMBERS = [
    { id: 'm1', name: '小明', role: '前端工程師', color: 'blue', avatar: '👨‍💻' },
    { id: 'm2', name: '小美', role: 'UI/UX 設計師', color: 'purple', avatar: '🎨' },
    { id: 'm3', name: '小華', role: '後端工程師', color: 'emerald', avatar: '⚙️' },
    { id: 'm4', name: '小強', role: 'DevOps 專員', color: 'amber', avatar: '🚀' },
    { id: 'm5', name: '小雅', role: '專案經理 (PM)', color: 'rose', avatar: '📋' }
  ];

  const SHIFT_TYPES = {
    morning: {
      id: 'morning',
      name: '早班 (09:00 - 18:00)',
      short: '早班',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      dotColor: 'bg-blue-500'
    },
    evening: {
      id: 'evening',
      name: '中班 (13:00 - 22:00)',
      short: '中班',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      dotColor: 'bg-indigo-500'
    },
    remote: {
      id: 'remote',
      name: '遠端 (WFH)',
      short: '遠端',
      color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
      dotColor: 'bg-teal-500'
    },
    off: {
      id: 'off',
      name: '休假 (OFF)',
      short: '休假',
      color: 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200',
      dotColor: 'bg-slate-400'
    }
  };

  const TASK_STATUSES = {
    todo: { id: 'todo', label: '待辦', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    in_progress: { id: 'in_progress', label: '進行中', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    done: { id: 'done', label: '已完成', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  const TASK_PRIORITIES = {
    high: { id: 'high', label: '高', color: 'bg-red-50 text-red-600 border-red-200' },
    medium: { id: 'medium', label: '中', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    low: { id: 'low', label: '低', color: 'bg-slate-50 text-slate-600 border-slate-200' }
  };

  function getDateOffset(daysOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  function getMondayOfCurrentWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function generateDefaultShifts() {
    const monday = getMondayOfCurrentWeek();
    const shifts = [];
    const patterns = {
      m1: ['morning', 'morning', 'remote', 'morning', 'morning', 'off', 'off'],
      m2: ['remote', 'morning', 'morning', 'morning', 'remote', 'off', 'off'],
      m3: ['evening', 'evening', 'evening', 'morning', 'morning', 'off', 'off'],
      m4: ['morning', 'morning', 'morning', 'evening', 'evening', 'off', 'off'],
      m5: ['morning', 'morning', 'remote', 'morning', 'morning', 'off', 'off']
    };

    DEFAULT_MEMBERS.forEach(member => {
      const memberPattern = patterns[member.id];
      for (let i = 0; i < 7; i++) {
        const shiftDate = new Date(monday);
        shiftDate.setDate(monday.getDate() + i);
        const dateStr = shiftDate.toISOString().split('T')[0];
        shifts.push({
          id: `shift_${member.id}_${dateStr}`,
          memberId: member.id,
          date: dateStr,
          shiftType: memberPattern[i] || 'morning',
          note: ''
        });
      }
    });

    return shifts;
  }

  function generateDefaultTasks() {
    return [
      {
        id: 't-1',
        title: '首頁排版優化與響應式微調',
        description: '改善行動版與平板版面配置，優化載入效能與按鈕點擊範圍。',
        assigneeId: 'm1',
        priority: 'high',
        dueDate: getDateOffset(2),
        status: 'in_progress',
        createdAt: getDateOffset(-2)
      },
      {
        id: 't-2',
        title: '設計系統組件庫 Figma 更新',
        description: '整理 Buttons, Cards, Modals 的統一設計 Tokens 與色彩規格。',
        assigneeId: 'm2',
        priority: 'medium',
        dueDate: getDateOffset(-1),
        status: 'done',
        createdAt: getDateOffset(-4)
      },
      {
        id: 't-3',
        title: '使用者驗證 API 效能測試與索引建立',
        description: '排查尖峰併發時的資料庫延遲，建立 Redis 快取層並壓測回傳延遲。',
        assigneeId: 'm3',
        priority: 'high',
        dueDate: getDateOffset(3),
        status: 'todo',
        createdAt: getDateOffset(-1)
      },
      {
        id: 't-4',
        title: 'CI/CD 自動化部署流程維護與監控',
        description: '更新 GitHub Actions Pipeline，新增安全掃描步驟與健康監測告警。',
        assigneeId: 'm4',
        priority: 'medium',
        dueDate: getDateOffset(1),
        status: 'in_progress',
        createdAt: getDateOffset(-3)
      },
      {
        id: 't-5',
        title: 'Q4 里程碑回顧與衝刺規劃會議',
        description: '統整各團隊開發進度，安排產品下一階段 Roadmap 與資源調配。',
        assigneeId: 'm5',
        priority: 'high',
        dueDate: getDateOffset(4),
        status: 'todo',
        createdAt: getDateOffset(0)
      },
      {
        id: 't-6',
        title: '設計新版會員登入介面 Prototype',
        description: '製作雙因素驗證 (2FA) 流程的高保真互動原型。',
        assigneeId: 'm2',
        priority: 'low',
        dueDate: getDateOffset(5),
        status: 'todo',
        createdAt: getDateOffset(-1)
      },
      {
        id: 't-7',
        title: '歷史日誌封存與資料表瘦身',
        description: '將半年前的系統日誌搬遷至冷儲存，釋放資料庫 SSD 空間。',
        assigneeId: 'm4',
        priority: 'low',
        dueDate: getDateOffset(-3),
        status: 'done',
        createdAt: getDateOffset(-5)
      }
    ];
  }

  // ==========================================
  // 2. 狀態管理器 (Store)
  // ==========================================
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
      const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!rawMembers) {
        this.members = [...DEFAULT_MEMBERS];
        this.saveMembers();
      } else {
        try {
          this.members = JSON.parse(rawMembers);
          if (!Array.isArray(this.members) || this.members.length === 0) {
            this.members = [...DEFAULT_MEMBERS];
            this.saveMembers();
          }
        } catch (e) {
          this.members = [...DEFAULT_MEMBERS];
          this.saveMembers();
        }
      }

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

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach(cb => cb());
    }

    saveMembers() {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));
    }

    saveShifts() {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(this.shifts));
    }

    saveTasks() {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
    }

    getMembers() {
      return this.members;
    }

    getMemberById(id) {
      return this.members.find(m => m.id === id);
    }

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

    resetToDefaults() {
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.SHIFTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      this.init();
      this.notify();
    }
  }

  const store = new Store();

  // ==========================================
  // 3. 週日曆排班視圖 (CalendarView)
  // ==========================================
  class CalendarView {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      this.currentMonday = getMondayOfCurrentWeek();
      this.options = options;
      this.selectedCell = null;
      this.init();
    }

    init() {
      this.setupShiftModal();
      this.render();
    }

    prevWeek() {
      this.currentMonday.setDate(this.currentMonday.getDate() - 7);
      this.render();
    }

    nextWeek() {
      this.currentMonday.setDate(this.currentMonday.getDate() + 7);
      this.render();
    }

    goToCurrentWeek() {
      this.currentMonday = getMondayOfCurrentWeek();
      this.render();
    }

    getWeekDays() {
      const days = [];
      const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
      const todayStr = new Date().toISOString().split('T')[0];

      for (let i = 0; i < 7; i++) {
        const d = new Date(this.currentMonday);
        d.setDate(this.currentMonday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const monthDayStr = `${d.getMonth() + 1}/${d.getDate()}`;
        days.push({
          date: d,
          dateStr,
          dayName: dayNames[i],
          monthDayStr,
          isToday: dateStr === todayStr,
          isWeekend: i >= 5
        });
      }
      return days;
    }

    setupShiftModal() {
      const modal = document.getElementById('shiftModal');
      if (!modal) return;

      const closeBtn = document.getElementById('closeShiftModalBtn');
      const cancelBtn = document.getElementById('cancelShiftModalBtn');
      const saveBtn = document.getElementById('saveShiftModalBtn');

      const closeModal = () => {
        modal.classList.add('hidden');
        this.selectedCell = null;
      };

      if (closeBtn) closeBtn.onclick = closeModal;
      if (cancelBtn) cancelBtn.onclick = closeModal;

      if (saveBtn) {
        saveBtn.onclick = () => {
          if (!this.selectedCell) return;
          const selectedType = document.querySelector('input[name="shiftTypeRadio"]:checked')?.value;
          const noteInput = document.getElementById('shiftNoteInput');
          const note = noteInput ? noteInput.value.trim() : '';

          if (selectedType) {
            store.setShift(this.selectedCell.memberId, this.selectedCell.dateStr, selectedType, note);
            if (this.options.onShiftUpdated) {
              this.options.onShiftUpdated();
            }
          }
          closeModal();
        };
      }

      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    openShiftModal(memberId, dateStr) {
      const member = store.getMemberById(memberId);
      if (!member) return;

      const currentShift = store.getShift(memberId, dateStr);
      const shiftType = currentShift ? currentShift.shiftType : 'morning';
      const note = currentShift ? (currentShift.note || '') : '';

      this.selectedCell = { memberId, dateStr, currentShift };

      const modal = document.getElementById('shiftModal');
      const titleEl = document.getElementById('shiftModalTitle');
      const memberNameEl = document.getElementById('shiftModalMemberName');
      const dateEl = document.getElementById('shiftModalDate');
      const noteInput = document.getElementById('shiftNoteInput');

      if (titleEl) titleEl.textContent = `修改排班 - ${member.name}`;
      if (memberNameEl) memberNameEl.textContent = `${member.name} (${member.role})`;
      if (dateEl) dateEl.textContent = `日期：${dateStr}`;
      if (noteInput) noteInput.value = note;

      const radio = document.querySelector(`input[name="shiftTypeRadio"][value="${shiftType}"]`);
      if (radio) radio.checked = true;

      modal.classList.remove('hidden');
    }

    render() {
      if (!this.container) return;

      const weekDays = this.getWeekDays();
      const members = store.getMembers();
      const startStr = weekDays[0].monthDayStr;
      const endStr = weekDays[6].monthDayStr;
      const yearStr = weekDays[0].date.getFullYear();

      const weekRangeEl = document.getElementById('currentWeekRange');
      if (weekRangeEl) {
        weekRangeEl.textContent = `${yearStr} 年 ${startStr} - ${endStr}`;
      }

      let tableHtml = `
        <div class="overflow-x-auto shadow-sm rounded-xl border border-slate-200 bg-white">
          <table class="w-full border-collapse min-w-[760px] text-left text-sm">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200">
                <th class="py-3.5 px-4 font-semibold text-slate-700 w-48">團隊成員</th>
                ${weekDays.map(day => `
                  <th class="py-3 px-3 text-center font-medium ${day.isWeekend ? 'bg-slate-100/50' : ''} ${day.isToday ? 'bg-indigo-50/60' : ''}">
                    <div class="flex flex-col items-center">
                      <span class="text-xs ${day.isToday ? 'text-indigo-600 font-bold' : 'text-slate-500'}">${day.dayName}</span>
                      <span class="inline-flex items-center justify-center text-xs mt-0.5 px-2 py-0.5 rounded-full ${day.isToday ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-700'}">
                        ${day.monthDayStr}
                      </span>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
      `;

      members.forEach((member) => {
        tableHtml += `
          <tr class="hover:bg-slate-50/60 transition-colors">
            <td class="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-3">
              <span class="text-2xl">${member.avatar}</span>
              <div>
                <div class="font-semibold text-slate-900">${member.name}</div>
                <div class="text-xs text-slate-500">${member.role}</div>
              </div>
            </td>
        `;

        weekDays.forEach(day => {
          const shift = store.getShift(member.id, day.dateStr);
          const shiftTypeKey = shift ? shift.shiftType : 'off';
          const shiftConfig = SHIFT_TYPES[shiftTypeKey] || SHIFT_TYPES.off;
          const hasNote = shift && shift.note && shift.note.trim().length > 0;

          tableHtml += `
            <td class="py-2.5 px-2 text-center align-middle ${day.isToday ? 'bg-indigo-50/30' : ''}">
              <button 
                type="button"
                data-member-id="${member.id}"
                data-date="${day.dateStr}"
                class="shift-cell-btn group w-full py-2 px-2.5 rounded-lg border text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-1.5 ${shiftConfig.color}"
                title="點擊修改排班 ${hasNote ? `(備註: ${shift.note})` : ''}"
              >
                <span class="w-1.5 h-1.5 rounded-full ${shiftConfig.dotColor}"></span>
                <span>${shiftConfig.short}</span>
                ${hasNote ? '<span class="text-amber-500 text-[10px]">📝</span>' : ''}
              </button>
            </td>
          `;
        });

        tableHtml += `</tr>`;
      });

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;

      this.container.innerHTML = tableHtml;

      this.container.querySelectorAll('.shift-cell-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const memberId = btn.getAttribute('data-member-id');
          const dateStr = btn.getAttribute('data-date');
          this.openShiftModal(memberId, dateStr);
        });
      });
    }
  }

  // ==========================================
  // 4. 任務看板管理器 (TaskManager)
  // ==========================================
  class TaskManager {
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

      if (assigneeSelect) {
        const members = store.getMembers();
        assigneeSelect.innerHTML = members.map(m => `
          <option value="${m.id}">${m.avatar} ${m.name} - ${m.role}</option>
        `).join('');
      }

      const openModal = () => {
        form.reset();
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

    getFilteredTasks() {
      return store.getTasks().filter(task => {
        if (this.filters.assigneeId !== 'all' && task.assigneeId !== this.filters.assigneeId) {
          return false;
        }
        if (this.filters.status !== 'all' && task.status !== this.filters.status) {
          return false;
        }
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

      const columns = [
        { id: 'todo', title: '待辦事項', icon: '📝', color: 'border-amber-400 bg-amber-50/50 text-amber-800' },
        { id: 'in_progress', title: '進行中', icon: '⚡', color: 'border-blue-400 bg-blue-50/50 text-blue-800' },
        { id: 'done', title: '已完成', icon: '✅', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800' }
      ];

      let html = `<div class="grid grid-cols-1 md:grid-cols-3 gap-5">`;

      columns.forEach(col => {
        const colTasks = filteredTasks.filter(t => t.status === col.id);

        html += `
          <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col min-h-[480px]">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="text-lg">${col.icon}</span>
                <h3 class="font-bold text-slate-800">${col.title}</h3>
              </div>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${col.color}">
                ${colTasks.length}
              </span>
            </div>

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

  // ==========================================
  // 5. 資料匯出模組 (Export)
  // ==========================================
  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportToJSON() {
    const data = {
      exportedAt: new Date().toISOString(),
      members: store.getMembers(),
      shifts: store.getShifts(),
      tasks: store.getTasks()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonString, `team_scheduler_backup_${dateStr}.json`, 'application/json;charset=utf-8');
  }

  function exportShiftsToCSV() {
    const shifts = store.getShifts();
    const members = store.getMembers();
    const headers = ['日期', '成員姓名', '職稱', '班別', '備註'];
    const rows = shifts.map(shift => {
      const member = members.find(m => m.id === shift.memberId) || { name: '未知', role: '' };
      const shiftType = SHIFT_TYPES[shift.shiftType]?.name || shift.shiftType;
      const note = (shift.note || '').replace(/"/g, '""');
      return `"${shift.date}","${member.name}","${member.role}","${shiftType}","${note}"`;
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `team_shifts_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  }

  function exportTasksToCSV() {
    const tasks = store.getTasks();
    const members = store.getMembers();
    const headers = ['任務編號', '任務名稱', '任務描述', '指派成員', '優先級', '截止日期', '狀態', '建立日期'];
    const rows = tasks.map(task => {
      const member = members.find(m => m.id === task.assigneeId) || { name: '未指派' };
      const priority = TASK_PRIORITIES[task.priority]?.label || task.priority;
      const status = TASK_STATUSES[task.status]?.label || task.status;
      const title = (task.title || '').replace(/"/g, '""');
      const desc = (task.description || '').replace(/"/g, '""');
      return `"${task.id}","${title}","${desc}","${member.name}","${priority}","${task.dueDate}","${status}","${task.createdAt}"`;
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `team_tasks_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  }

  function initExportHandlers() {
    const exportBtn = document.getElementById('exportDropdownBtn');
    const exportMenu = document.getElementById('exportDropdownMenu');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportShiftsCsvBtn = document.getElementById('exportShiftsCsvBtn');
    const exportTasksCsvBtn = document.getElementById('exportTasksCsvBtn');

    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        exportMenu.classList.add('hidden');
      });

      exportMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        exportToJSON();
        exportMenu?.classList.add('hidden');
      });
    }

    if (exportShiftsCsvBtn) {
      exportShiftsCsvBtn.addEventListener('click', () => {
        exportShiftsToCSV();
        exportMenu?.classList.add('hidden');
      });
    }

    if (exportTasksCsvBtn) {
      exportTasksCsvBtn.addEventListener('click', () => {
        exportTasksToCSV();
        exportMenu?.classList.add('hidden');
      });
    }
  }

  // ==========================================
  // 6. 統計與主入口 (App & Stats)
  // ==========================================
  function updateStats() {
    const members = store.getMembers();
    const tasks = store.getTasks();
    const todayStr = new Date().toISOString().split('T')[0];

    let workingCount = 0;
    let remoteCount = 0;
    let offCount = 0;

    members.forEach(m => {
      const shift = store.getShift(m.id, todayStr);
      const type = shift ? shift.shiftType : 'off';
      if (type === 'morning' || type === 'evening') workingCount++;
      else if (type === 'remote') remoteCount++;
      else offCount++;
    });

    const totalTasks = tasks.length;
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    const el = (id, val) => {
      const dom = document.getElementById(id);
      if (dom) dom.textContent = val;
    };

    el('statTotalMembers', members.length);
    el('statWorkingToday', workingCount);
    el('statRemoteToday', remoteCount);
    el('statOffToday', offCount);

    el('statTotalTasks', totalTasks);
    el('statTodoTasks', todoCount);
    el('statInProgressTasks', inProgressCount);
    el('statDoneTasks', doneCount);
    el('statCompletionRate', `${completionRate}%`);

    const progressBar = document.getElementById('statCompletionProgress');
    if (progressBar) {
      progressBar.style.width = `${completionRate}%`;
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      info: 'bg-slate-900 text-white',
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-600 text-white',
      error: 'bg-red-600 text-white'
    };

    toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2600);
  }

  // 頁面就緒初始化
  document.addEventListener('DOMContentLoaded', () => {
    const calendar = new CalendarView('calendarContainer', {
      onShiftUpdated: () => {
        updateStats();
        showToast('排班資料已更新', 'success');
      }
    });

    document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
      calendar.prevWeek();
    });
    document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
      calendar.nextWeek();
    });
    document.getElementById('todayWeekBtn')?.addEventListener('click', () => {
      calendar.goToCurrentWeek();
    });

    const taskManager = new TaskManager('taskKanbanContainer', {
      onTaskChanged: () => {
        updateStats();
        showToast('任務已更新', 'info');
      }
    });

    initExportHandlers();

    document.getElementById('resetDataBtn')?.addEventListener('click', () => {
      if (confirm('確定要清除自訂變更並重設回預設範例資料嗎？（這將重載小明、小美等5位成員的預設排班與任務）')) {
        store.resetToDefaults();
        calendar.render();
        taskManager.render();
        updateStats();
        showToast('已還原為預設範例資料', 'success');
      }
    });

    store.subscribe(() => {
      updateStats();
    });

    updateStats();
  });
})();
