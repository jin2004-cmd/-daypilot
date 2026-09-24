/* DayPilot · Eval 评估流水线
 * 双层质量门：
 *   L1 规则校验（确定性）：结构、字段、时长预算、重复项
 *   L2 质量打分（LLM-as-Judge / 启发式）：0-10 分
 * 不达标 → 自动重试（最多 maxRetries 次），全程留痕可审计
 */
window.DP = window.DP || {};

DP.eval = (function () {

  /**
   * L1 规则校验：规划结果必须满足的硬约束
   * @returns {{pass:boolean, issues:string[]}}
   */
  function validatePlan(tasks, maxMinutes) {
    var issues = [];
    if (!Array.isArray(tasks)) {
      return { pass: false, issues: ["输出不是任务数组（JSON 结构错误）"] };
    }
    if (tasks.length < 3) issues.push("任务数过少（" + tasks.length + " < 3），规划不充分");
    if (tasks.length > 5) issues.push("任务数过多（" + tasks.length + " > 5），超出单日可执行粒度");

    var total = 0;
    var seen = {};
    tasks.forEach(function (t, i) {
      var tag = "任务" + (i + 1);
      if (!t || typeof t !== "object") { issues.push(tag + "：不是合法对象"); return; }
      if (!t.title || !String(t.title).trim()) issues.push(tag + "：缺少标题");
      else if (String(t.title).length > 30) issues.push(tag + "：标题超过 30 字，不够精炼");
      if (["高", "中", "低"].indexOf(t.priority) < 0) issues.push(tag + "：优先级非法（必须为 高/中/低）");
      var m = parseInt(t.minutes, 10);
      if (!m || m < 5 || m > 240) issues.push(tag + "：预估时长非法（需 5-240 分钟）");
      else total += m;
      if (t.title) {
        var k = String(t.title).trim();
        if (seen[k]) issues.push(tag + "：与其它任务标题重复");
        seen[k] = true;
      }
    });
    if (maxMinutes && total > maxMinutes) {
      issues.push("总时长 " + total + " 分钟超出可用预算 " + maxMinutes + " 分钟（规划超载）");
    }
    return { pass: issues.length === 0, issues: issues, totalMinutes: total };
  }

  /**
   * L2 启发式打分（Mock 模式 / LLM judge 的降级方案）
   * 维度：时长利用率、优先级结构、目标覆盖度
   */
  function heuristicScore(tasks, goals, maxMinutes) {
    if (!Array.isArray(tasks) || !tasks.length) return { score: 0, comment: "无有效任务" };
    var score = 10;
    var notes = [];

    var total = tasks.reduce(function (s, t) { return s + (parseInt(t.minutes, 10) || 0); }, 0);
    if (maxMinutes) {
      var util = total / maxMinutes;
      if (util < 0.4) { score -= 2; notes.push("时长利用率偏低（" + Math.round(util * 100) + "%），规划偏保守"); }
      else if (util > 1) { score -= 4; notes.push("超出时间预算"); }
      else notes.push("时长利用率 " + Math.round(util * 100) + "%");
    }

    var high = tasks.filter(function (t) { return t.priority === "高"; }).length;
    if (high === 0) { score -= 2; notes.push("缺少高优先级任务，重点不突出"); }
    else if (high > 2) { score -= 1; notes.push("高优先级任务偏多，注意精力分配"); }
    else notes.push("优先级结构合理");

    if (goals && goals.length) {
      var text = tasks.map(function (t) { return t.title; }).join(" ");
      var covered = goals.filter(function (g) {
        return g.split(/[，,：:（(]/)[0].split(/\s+/).some(function (kw) {
          return kw.length >= 2 && text.indexOf(kw.slice(0, 4)) >= 0;
        });
      }).length;
      if (covered === 0) { score -= 3; notes.push("任务与目标池脱节"); }
      else notes.push("覆盖 " + covered + "/" + goals.length + " 个目标方向");
    }

    score = Math.max(1, Math.min(10, score));
    return { score: score, comment: notes.join("；") };
  }

  /**
   * 质量门主流程：生成 → L1 校验 → L2 打分 → 不达标重试
   * @param {object} opts { name, generate(attempt), validate(result), judge(result), threshold, maxRetries }
   * @returns {Promise<{ok, result, report}>}
   */
  async function gate(opts) {
    var threshold = opts.threshold || 7;
    var maxRetries = opts.maxRetries == null ? 2 : opts.maxRetries;
    var attempts = [];
    var best = null;

    for (var attempt = 0; attempt <= maxRetries; attempt++) {
      var result = await opts.generate(attempt);
      var v = opts.validate(result);
      var j = v.pass ? await opts.judge(result) : { score: 0, comment: "规则校验未通过，跳过质量打分" };
      var rec = { attempt: attempt + 1, pass: v.pass && j.score >= threshold, issues: v.issues || [], score: j.score, comment: j.comment };
      attempts.push(rec);

      if (!best || (v.pass && j.score > (best._score || -1))) {
        best = result; best._score = v.pass ? j.score : -1;
      }
      if (rec.pass) break;
    }

    var finalRec = attempts[attempts.length - 1];
    var report = {
      name: opts.name,
      attempts: attempts,
      retries: attempts.length - 1,
      finalPass: finalRec.pass,
      finalScore: finalRec.score,
      mode: DP.llm && DP.llm.isLive() ? "live" : "mock",
      threshold: threshold
    };

    if (best && best._score !== undefined) delete best._score;
    return { ok: finalRec.pass, result: finalRec.pass ? result : best, report: report };
  }

  return { validatePlan: validatePlan, heuristicScore: heuristicScore, gate: gate };
})();
