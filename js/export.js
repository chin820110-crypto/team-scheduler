// js/export.js - 資料匯出模組 (支援 JSON 與 UTF-8 CSV 匯出)

import { store } from './store.js';
import { SHIFT_TYPES, TASK_STATUSES, TASK_PRIORITIES } from './data.js';

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

// 匯出完整 JSON
export function exportToJSON() {
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

// 匯出排班清單為 CSV (加入 UTF-8 BOM 防止 Excel 亂碼)
export function exportShiftsToCSV() {
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

// 匯出任務清單為 CSV (加入 UTF-8 BOM)
export function exportTasksToCSV() {
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

// 初始化匯出按鈕與選單
export function initExportHandlers() {
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
