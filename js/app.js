// js/app.js - 應用程式主入口與狀態統合

import { store } from './store.js';
import { CalendarView } from './calendar.js';
import { TaskManager } from './tasks.js';
import { initExportHandlers } from './export.js';

// 頂部統計指標渲染
function updateStats() {
  const members = store.getMembers();
  const shifts = store.getShifts();
  const tasks = store.getTasks();

  const todayStr = new Date().toISOString().split('T')[0];

  // 今日出勤統計
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

  // 更新 DOM
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

// 簡易 Toast 提示
export function showToast(message, type = 'info') {
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

  // 動畫淡入
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // 自動淡出
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2600);
}

// 初始化主流程
document.addEventListener('DOMContentLoaded', () => {
  // 初始化排班日曆
  const calendar = new CalendarView('calendarContainer', {
    onShiftUpdated: () => {
      updateStats();
      showToast('排班資料已更新', 'success');
    }
  });

  // 綁定排班週切換按鈕
  document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
    calendar.prevWeek();
  });
  document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
    calendar.nextWeek();
  });
  document.getElementById('todayWeekBtn')?.addEventListener('click', () => {
    calendar.goToCurrentWeek();
  });

  // 初始化任務管理器
  const taskManager = new TaskManager('taskKanbanContainer', {
    onTaskChanged: () => {
      updateStats();
      showToast('任務已更新', 'info');
    }
  });

  // 初始化匯出下拉選單與功能
  initExportHandlers();

  // 重設為預設資料按鈕
  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    if (confirm('確定要清除自訂變更並重設回預設範例資料嗎？（這將重載小明、小美等5位成員的預設排班與任務）')) {
      store.resetToDefaults();
      calendar.render();
      taskManager.render();
      updateStats();
      showToast('已還原為預設範例資料', 'success');
    }
  });

  // 監聽狀態變更以保持統計最新
  store.subscribe(() => {
    updateStats();
  });

  // 初次更新統計
  updateStats();
});
