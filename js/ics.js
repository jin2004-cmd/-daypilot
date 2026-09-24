/* DayPilot · .ics 日历导出（今日事项 → 手机日历 + 闹钟提醒） */
window.DP = window.DP || {};

DP.ics = (function () {

  function pad(n) { return String(n).padStart(2, "0"); }

  // 本地时间 → ICS UTC 格式
  function toUTC(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
  }

  function escapeText(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  /**
   * 把当天任务排成日历事件：从 startHour 点开始顺序排布
   */
  function build(tasks, dateStr, startHour) {
    startHour = startHour || 9;
    var parts = dateStr.split("-");
    var cursor = new Date(parts[0], parts[1] - 1, parts[2], startHour, 0, 0);
    var now = toUTC(new Date());
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DayPilot//Today//CN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    tasks.forEach(function (t, i) {
      var start = new Date(cursor);
      var end = new Date(cursor.getTime() + (t.minutes || 30) * 60000);
      cursor = end;
      lines.push("BEGIN:VEVENT");
      lines.push("UID:daypilot-" + dateStr.replace(/-/g, "") + "-" + i + "@daypilot");
      lines.push("DTSTAMP:" + now);
      lines.push("DTSTART:" + toUTC(start));
      lines.push("DTEND:" + toUTC(end));
      lines.push("SUMMARY:[" + t.priority + "] " + escapeText(t.title));
      lines.push("DESCRIPTION:DayPilot 日航 · 今日事");
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT10M");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:" + escapeText(t.title));
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function download(tasks, dateStr) {
    if (!tasks.length) return false;
    var ics = build(tasks, dateStr);
    var blob = new Blob(["\ufeff" + ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "daypilot-" + dateStr.replace(/-/g, "") + ".ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    return true;
  }

  return { build: build, download: download };
})();
