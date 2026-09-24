/* DayPilot · 数据层（localStorage 本地优先） */
window.DP = window.DP || {};

DP.store = (function () {
  var KEY = "daypilot_v1";
  var state = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function dateStr(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function defaults() {
    return {
      settings: { apiKey: "", baseUrl: "https://api.deepseek.com", model: "deepseek-chat", theme: "auto" },
      goals: DP.templates.qiuzhaoGoals.slice(),
      days: {},
      evalLogs: [],
      onboarded: false,
      createdAt: new Date().toISOString()
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function init() {
    state = load() || defaults();
    save();
  }

  function getDay(ds) {
    ds = ds || dateStr();
    if (!state.days[ds]) state.days[ds] = { tasks: [], planReport: null, review: null };
    if (!state.days[ds].tasks) state.days[ds].tasks = [];
    return state.days[ds];
  }

  function addTasks(ds, tasks) {
    var day = getDay(ds);
    tasks.forEach(function (t) {
      day.tasks.push({
        id: uid(),
        title: String(t.title || "").slice(0, 60),
        priority: ["高", "中", "低"].indexOf(t.priority) >= 0 ? t.priority : "中",
        minutes: parseInt(t.minutes, 10) || 30,
        done: false,
        doneAt: null
      });
    });
    save();
  }

  function addTask(ds, task) { addTasks(ds, [task]); }

  function toggleTask(ds, id) {
    var day = getDay(ds);
    day.tasks.forEach(function (t) {
      if (t.id === id) {
        t.done = !t.done;
        t.doneAt = t.done ? new Date().toISOString() : null;
      }
    });
    save();
  }

  function editTask(ds, id, patch) {
    var day = getDay(ds);
    day.tasks.forEach(function (t) {
      if (t.id === id) {
        if (patch.title != null) t.title = String(patch.title).slice(0, 60);
        if (patch.priority != null && ["高", "中", "低"].indexOf(patch.priority) >= 0) t.priority = patch.priority;
        if (patch.minutes != null) t.minutes = parseInt(patch.minutes, 10) || t.minutes;
      }
    });
    save();
  }

  function deleteTask(ds, id) {
    var day = getDay(ds);
    day.tasks = day.tasks.filter(function (t) { return t.id !== id; });
    save();
  }

  function setPlanReport(ds, report) { getDay(ds).planReport = report; save(); }
  function setReview(ds, review) { getDay(ds).review = review; save(); }

  function setGoals(goals) {
    state.goals = goals.filter(function (g) { return g && g.trim(); });
    save();
  }

  function setSettings(patch) {
    Object.keys(patch).forEach(function (k) { state.settings[k] = patch[k]; });
    save();
  }

  function logEval(entry) {
    entry.ts = new Date().toISOString();
    state.evalLogs.unshift(entry);
    if (state.evalLogs.length > 50) state.evalLogs.length = 50;
    save();
  }

  /* ---- 统计 ---- */
  function dayStats(ds) {
    var day = getDay(ds);
    var total = day.tasks.length;
    var done = day.tasks.filter(function (t) { return t.done; }).length;
    return { total: total, done: done, rate: total ? done / total : 0 };
  }

  function streak() {
    var n = 0;
    var d = new Date();
    // 今天没完成不断 streak，从昨天往前数；若今天已有全部完成也计入
    var today = dayStats(dateStr(d));
    if (today.total > 0 && today.done === today.total) n++;
    d.setDate(d.getDate() - 1);
    while (true) {
      var s = dayStats(dateStr(d));
      if (s.total > 0 && s.done === s.total) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  }

  function lastNDays(n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var ds = dateStr(d);
      var s = dayStats(ds);
      out.push({ date: ds, label: (d.getMonth() + 1) + "/" + d.getDate(), total: s.total, done: s.done, rate: s.rate, hasReview: !!getDay(ds).review });
    }
    return out;
  }

  function exportJSON() { return JSON.stringify(state, null, 2); }

  function importJSON(text) {
    var data = JSON.parse(text);
    if (!data || typeof data !== "object" || !data.settings) throw new Error("格式不正确");
    state = data;
    save();
  }

  function resetAll() {
    localStorage.removeItem(KEY);
    state = defaults();
    save();
  }

  return {
    init: init, save: save, dateStr: dateStr, uid: uid,
    state: function () { return state; },
    settings: function () { return state.settings; },
    goals: function () { return state.goals; },
    evalLogs: function () { return state.evalLogs; },
    getDay: getDay, addTask: addTask, addTasks: addTasks,
    toggleTask: toggleTask, deleteTask: deleteTask, editTask: editTask,
    setPlanReport: setPlanReport, setReview: setReview,
    setGoals: setGoals, setSettings: setSettings, logEval: logEval,
    dayStats: dayStats, streak: streak, lastNDays: lastNDays,
    exportJSON: exportJSON, importJSON: importJSON, resetAll: resetAll,
    markOnboarded: function () { state.onboarded = true; save(); },
    isOnboarded: function () { return state.onboarded; }
  };
})();
