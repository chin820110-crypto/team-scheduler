// js/calendar.js - 週排班行事曆視圖與排班互動

import { store } from './store.js';
import { SHIFT_TYPES, getMondayOfCurrentWeek } from './data.js';

export class CalendarView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.currentMonday = getMondayOfCurrentWeek();
    this.options = options;
    this.selectedCell = null; // 記錄當前正在編輯排班的格位 { memberId, dateStr, currentShift }
    this.init();
  }

  init() {
    this.setupShiftModal();
    this.render();
  }

  // 設定週切換
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

  // 取得本週 7 天的日期陣列
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

  // 設定點擊編輯排班彈窗
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

    // 點擊遮罩外關閉
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

    // 更新標題區間
    const weekRangeEl = document.getElementById('currentWeekRange');
    if (weekRangeEl) {
      weekRangeEl.textContent = `${yearStr} 年 ${startStr} - ${endStr}`;
    }

    // 建立表格 HTML
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

    // 綁定所有排班按鈕事件
    const buttons = this.container.querySelectorAll('.shift-cell-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const memberId = btn.getAttribute('data-member-id');
        const dateStr = btn.getAttribute('data-date');
        this.openShiftModal(memberId, dateStr);
      });
    });
  }
}
