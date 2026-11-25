window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0094"]=[
  {
    "decision": "把 C1a 与 C1b 合为一趟，先收 C1a。",
    "evidence": "两单合计 17，容量 17。全部需求 34 至少分成 2 趟。",
    "consequence": "若交换两站，C1a 最早也会晚 5 个时间单位。",
    "comparison": {
      "title": "同一批取货点调换顺序，C1a 会晚到多久？",
      "options": [
        {
          "label": "C1a → C1b",
          "value": 0,
          "unit": "时间单位",
          "note": "按解中时刻 9 为 C1a 服务，处于允许时窗。"
        },
        {
          "label": "C1b → C1a",
          "value": 5,
          "unit": "时间单位",
          "note": "同一出场时刻，反向按最早可行时刻服务，抵达 C1a 时为 17，超过其最晚时刻 12。"
        }
      ],
      "world": {
        "title": "倒序取货 · 时窗检验",
        "kind": "route",
        "valid": false,
        "route": [
          "0",
          "C1b",
          "C1a"
        ],
        "marks": [
          [
            "C1b",
            "① 开始 11"
          ],
          [
            "C1a",
            "② 最早 17 / 截止 12"
          ]
        ],
        "description": "固定出场时刻 0 和本趟两位客户，按反向次序推算。红色虚线在首个逾期客户处截止。"
      }
    }
  },
  {
    "decision": "趟次 1 把 C1a 排在第 1 站，装入 9。",
    "evidence": "从 0 最早可在 9 开工；选定 9，最晚为 12。",
    "consequence": "装货后 9/17，服务持续 1，最早 10 才能离开。"
  },
  {
    "decision": "趟次 1 把 C1b 排在第 2 站，装入 8。",
    "evidence": "从 C1a 最早可在 13 开工；选定 13，最晚为 15。",
    "consequence": "装货后 17/17，服务持续 3，最早 16 才能离开。"
  },
  {
    "decision": "把 17 单位货物安排在 25 至 30 的卸货位。",
    "evidence": "车辆于 25 返场，需卸货 4.25 时间单位，每个完整时隙长 5。",
    "consequence": "等待 0 后占用一个卸货位；本趟路线距离 21。"
  },
  {
    "decision": "把 C2a 与 C2b 合为一趟，先收 C2a。",
    "evidence": "两单合计 17，容量 17。全部需求 34 至少分成 2 趟。",
    "consequence": "若交换两站，C2a 最早也会晚 7 个时间单位。",
    "comparison": {
      "title": "同一批取货点调换顺序，C2a 会晚到多久？",
      "options": [
        {
          "label": "C2a → C2b",
          "value": 0,
          "unit": "时间单位",
          "note": "按解中时刻 34 为 C2a 服务，处于允许时窗。"
        },
        {
          "label": "C2b → C2a",
          "value": 7,
          "unit": "时间单位",
          "note": "同一出场时刻，反向按最早可行时刻服务，抵达 C2a 时为 42，超过其最晚时刻 35。"
        }
      ],
      "world": {
        "title": "倒序取货 · 时窗检验",
        "kind": "route",
        "valid": false,
        "route": [
          "0",
          "C2b",
          "C2a"
        ],
        "marks": [
          [
            "C2b",
            "① 开始 38"
          ],
          [
            "C2a",
            "② 最早 42 / 截止 35"
          ]
        ],
        "description": "固定出场时刻 25 和本趟两位客户，按反向次序推算。红色虚线在首个逾期客户处截止。"
      }
    }
  },
  {
    "decision": "在预约末端 30 释放车辆及卸货位。",
    "evidence": "车场同时可卸 1 辆，两个预约分别为 25–30、50–55。",
    "consequence": "本趟覆盖 C1a → C1b；两趟距离相加为 42。"
  },
  {
    "decision": "趟次 2 把 C2a 排在第 1 站，装入 8。",
    "evidence": "从 0 最早可在 34 开工；选定 34，最晚为 35。",
    "consequence": "装货后 8/17，服务持续 2，最早 36 才能离开。"
  },
  {
    "decision": "趟次 2 把 C2b 排在第 2 站，装入 9。",
    "evidence": "从 C2a 最早可在 39 开工；选定 39，最晚为 39。",
    "consequence": "装货后 17/17，服务持续 1，最早 40 才能离开。"
  },
  {
    "decision": "把 17 单位货物安排在 50 至 55 的卸货位。",
    "evidence": "车辆于 49 返场，需卸货 4.25 时间单位，每个完整时隙长 5。",
    "consequence": "等待 1 后占用一个卸货位；本趟路线距离 21。"
  },
  {
    "decision": "在预约末端 55 释放车辆及卸货位。",
    "evidence": "车场同时可卸 1 辆，两个预约分别为 25–30、50–55。",
    "consequence": "本趟覆盖 C2a → C2b；两趟距离相加为 42。"
  }
];
