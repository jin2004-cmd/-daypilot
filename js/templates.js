/* DayPilot · 预置模板（秋招模式） */
window.DP = window.DP || {};

DP.templates = {
  // 秋招目标池：AI 规划时的默认输入
  qiuzhaoGoals: [
    "拿下 2027 春招 AI 内容运营 / AIGC 运营 offer（当前秋招正式批投递中）",
    "蓝色光标实习：高质量完成客户剪辑任务，沉淀可署名成片与简历数字",
    "打造 DayPilot 开源项目并推上 GitHub，作为秋招作品集弹药"
  ],

  // 一键开始今天的模板任务
  qiuzhaoTasks: [
    { title: "秋招投递 1 小时（岗位库勾选 + 记录台账）", priority: "高", minutes: 60 },
    { title: "蓝标剪辑：推进当日客户素材剪辑", priority: "高", minutes: 90 },
    { title: "当场记录今日工作产出数字（简历素材）", priority: "中", minutes: 10 },
    { title: "作品集 / GitHub 打磨 30 分钟", priority: "中", minutes: 30 },
    { title: "每日三行复盘：今天做成了什么", priority: "低", minutes: 10 }
  ],

  // Mock 模式下的规划任务池（AI 拆解时的素材）
  mockPlanPool: [
    { title: "秋招投递：筛选 5 个匹配岗位并完成投递", priority: "高", minutes: 60 },
    { title: "更新投递台账，标注今日进度", priority: "中", minutes: 10 },
    { title: "蓝标剪辑：完成 1 条 Reels 粗剪并自检", priority: "高", minutes: 90 },
    { title: "剪辑反馈修改与导出交付", priority: "高", minutes: 45 },
    { title: "记录今日工作数字（日产 / 过审率）", priority: "中", minutes: 10 },
    { title: "DayPilot：完成一个功能模块并提交代码", priority: "中", minutes: 60 },
    { title: "简历同步更新一处最新数据", priority: "中", minutes: 20 },
    { title: "阅读 1 篇 AIGC 运营面经并记 3 条要点", priority: "低", minutes: 20 },
    { title: "运动或散步 20 分钟，保持状态", priority: "低", minutes: 20 },
    { title: "每晚三行复盘", priority: "低", minutes: 10 }
  ],

  // Mock 复盘评语库
  mockReviewGood: [
    "今日完成度优秀，高优先级任务全部清空，节奏感很好。保持这个状态，明天可以继续加压。",
    "执行力在线的一天。关键任务没有拖延，说明任务拆解的粒度合适，明天可沿用同样的拆法。"
  ],
  mockReviewMid: [
    "完成度过半，但有高优先级任务被遗留。建议明天开工第一件事就啃最难的那块，别给它发酵的机会。",
    "今天属于『忙而低效』：做了不少动作，但关键结果推进有限。明天的清单需要更狠地做减法。"
  ],
  mockReviewBad: [
    "今天完成度偏低，需要警惕连续滑坡。建议明天把任务数压到 3 件以内，先找回完成的感觉。",
    "规划量明显超出实际可用时间，属于规划超载。明天先把可用时长如实告诉 AI，再让它拆任务。"
  ]
};
