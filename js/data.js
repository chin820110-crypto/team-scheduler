// js/data.js - 預設團隊成員、班別設定與初始化種子資料

export const DEFAULT_MEMBERS = [
  { id: 'm1', name: '小明', role: '前端工程師', color: 'blue', avatar: '👨‍💻' },
  { id: 'm2', name: '小美', role: 'UI/UX 設計師', color: 'purple', avatar: '🎨' },
  { id: 'm3', name: '小華', role: '後端工程師', color: 'emerald', avatar: '⚙️' },
  { id: 'm4', name: '小強', role: 'DevOps 專員', color: 'amber', avatar: '🚀' },
  { id: 'm5', name: '小雅', role: '專案經理 (PM)', color: 'rose', avatar: '📋' }
];

export const SHIFT_TYPES = {
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

export const TASK_STATUSES = {
  todo: { id: 'todo', label: '待辦', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'clock' },
  in_progress: { id: 'in_progress', label: '進行中', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'loader' },
  done: { id: 'done', label: '已完成', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'check-circle' }
};

export const TASK_PRIORITIES = {
  high: { id: 'high', label: '高', color: 'bg-red-50 text-red-600 border-red-200' },
  medium: { id: 'medium', label: '中', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  low: { id: 'low', label: '低', color: 'bg-slate-50 text-slate-600 border-slate-200' }
};

// 產生相對當前週的標準日期格式 YYYY-MM-DD
function getDateOffset(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// 取得本週一的日期物件
export function getMondayOfCurrentWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 週日為 0，調整週一為起始
  return new Date(d.setDate(diff));
}

// 產生預設的週排班資料（以當前週為準）
export function generateDefaultShifts() {
  const monday = getMondayOfCurrentWeek();
  const shifts = [];
  
  // 排班預設分佈模式
  const patterns = {
    m1: ['morning', 'morning', 'remote', 'morning', 'morning', 'off', 'off'], // 小明
    m2: ['remote', 'morning', 'morning', 'morning', 'remote', 'off', 'off'],  // 小美
    m3: ['evening', 'evening', 'evening', 'morning', 'morning', 'off', 'off'], // 小華
    m4: ['morning', 'morning', 'morning', 'evening', 'evening', 'off', 'off'], // 小強
    m5: ['morning', 'morning', 'remote', 'morning', 'morning', 'off', 'off']   // 小雅
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

// 產生預設的任務資料
export function generateDefaultTasks() {
  return [
    {
      id: 't-1',
      title: '首頁排版優化與響應式微調',
      description: '改善行動版與平板版面配置，優化載入效能與按鈕點擊範圍。',
      assigneeId: 'm1', // 小明
      priority: 'high',
      dueDate: getDateOffset(2),
      status: 'in_progress',
      createdAt: getDateOffset(-2)
    },
    {
      id: 't-2',
      title: '設計系統組件庫 Figma 更新',
      description: '整理 Buttons, Cards, Modals 的統一設計 Tokens 與色彩規格。',
      assigneeId: 'm2', // 小美
      priority: 'medium',
      dueDate: getDateOffset(-1),
      status: 'done',
      createdAt: getDateOffset(-4)
    },
    {
      id: 't-3',
      title: '使用者驗證 API 效能測試與索引建立',
      description: '排查尖峰併發時的資料庫延遲，建立 Redis 快取層並壓測回傳延遲。',
      assigneeId: 'm3', // 小華
      priority: 'high',
      dueDate: getDateOffset(3),
      status: 'todo',
      createdAt: getDateOffset(-1)
    },
    {
      id: 't-4',
      title: 'CI/CD 自動化部署流程維護與監控',
      description: '更新 GitHub Actions Pipeline，新增安全掃描步驟與健康監測告警。',
      assigneeId: 'm4', // 小強
      priority: 'medium',
      dueDate: getDateOffset(1),
      status: 'in_progress',
      createdAt: getDateOffset(-3)
    },
    {
      id: 't-5',
      title: 'Q4 里程碑回顧與衝刺規劃會議',
      description: '統整各團隊開發進度，安排產品下一階段 Roadmap 與資源調配。',
      assigneeId: 'm5', // 小雅
      priority: 'high',
      dueDate: getDateOffset(4),
      status: 'todo',
      createdAt: getDateOffset(0)
    },
    {
      id: 't-6',
      title: '設計新版會員登入介面 Prototype',
      description: '製作雙因素驗證 (2FA) 流程的高保真互動原型。',
      assigneeId: 'm2', // 小美
      priority: 'low',
      dueDate: getDateOffset(5),
      status: 'todo',
      createdAt: getDateOffset(-1)
    },
    {
      id: 't-7',
      title: '歷史日誌封存與資料表瘦身',
      description: '將半年前的系統日誌搬遷至冷儲存，釋放資料庫 SSD 空間。',
      assigneeId: 'm4', // 小強
      priority: 'low',
      dueDate: getDateOffset(-3),
      status: 'done',
      createdAt: getDateOffset(-5)
    }
  ];
}
