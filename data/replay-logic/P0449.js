window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0449"]=[
  {
    "decision": "8 辆车按站点分布为 4、0、3、1。",
    "evidence": "每辆车在本期只可分配给一个目的地和一种货类；空车同样占用车辆名额。",
    "consequence": "载货和空驶都会改变下一期各站可用车辆，策略在当期调度费之外计入新分布的延续成本。"
  },
  {
    "decision": "把本站 4 辆指派为 站3空车×2、站3货类1×1、站3货类2×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站3空车”改为“站4货类1”，该期调度费变化 -1.9998。",
    "consequence": "改派还会使策略延续成本变化 3，合计阶段成本变化 1.0002。",
    "comparison": {
      "title": "第 1 期站 1 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -87.997 加延续成本 -46 为比较基线。"
        },
        {
          "label": "站3空车 改为 站4货类1",
          "value": 1.000163,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 -1.9998，新分布延续成本变化 3。"
        }
      ],
      "world": {
        "title": "第 1 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_01",
          "location_04"
        ],
        "oldRoute": [
          "location_01",
          "location_03"
        ],
        "oldLabel": "站3空车",
        "newLabel": "站4货类1",
        "stocks": [
          0,
          1,
          4,
          3
        ],
        "previous": [
          0,
          1,
          5,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 0 → 0 辆"
          ],
          [
            "location_02",
            "站 2 · 1 → 1 辆"
          ],
          [
            "location_03",
            "站 3 · 5 → 4 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 3 辆"
          ]
        ],
        "description": "起点为站 1。灰色虚线为原指派（站3空车），紫色弧为改派（站4货类1）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 3 辆指派为 站2货类1×1、站3货类2×1、站4货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站4货类1”改为“站1货类2”，该期调度费变化 1.0001。",
    "consequence": "改派还会使策略延续成本变化 5，合计阶段成本变化 6.0001。",
    "comparison": {
      "title": "第 1 期站 3 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -87.997 加延续成本 -46 为比较基线。"
        },
        {
          "label": "站4货类1 改为 站1货类2",
          "value": 6.000124,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 1.0001，新分布延续成本变化 5。"
        }
      ],
      "world": {
        "title": "第 1 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_03",
          "location_01"
        ],
        "oldRoute": [
          "location_03",
          "location_04"
        ],
        "oldLabel": "站4货类1",
        "newLabel": "站1货类2",
        "stocks": [
          1,
          1,
          5,
          1
        ],
        "previous": [
          0,
          1,
          5,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 0 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 1 → 1 辆"
          ],
          [
            "location_03",
            "站 3 · 5 → 5 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 1 辆"
          ]
        ],
        "description": "起点为站 3。灰色虚线为原指派（站4货类1），紫色弧为改派（站1货类2）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 1 辆指派为 站4货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站4货类1”改为“站3货类1”，该期调度费变化 4。",
    "consequence": "改派还会使策略延续成本变化 0，合计阶段成本变化 4。",
    "comparison": {
      "title": "第 1 期站 4 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -87.997 加延续成本 -46 为比较基线。"
        },
        {
          "label": "站4货类1 改为 站3货类1",
          "value": 3.999953,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 4，新分布延续成本变化 0。"
        }
      ],
      "world": {
        "title": "第 1 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_04",
          "location_03"
        ],
        "oldRoute": [
          "location_04",
          "location_04"
        ],
        "oldLabel": "站4货类1",
        "newLabel": "站3货类1",
        "stocks": [
          0,
          1,
          6,
          1
        ],
        "previous": [
          0,
          1,
          5,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 0 → 0 辆"
          ],
          [
            "location_02",
            "站 2 · 1 → 1 辆"
          ],
          [
            "location_03",
            "站 3 · 5 → 6 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 1 辆"
          ]
        ],
        "description": "起点为站 4。灰色虚线为原指派（站4货类1），紫色弧为改派（站3货类1）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把全站调度同时按目的地汇总为下一状态 0、1、5、2。",
    "evidence": "合计 8 辆。本期派车费用 -87.997，评估本期动作时另计延续成本 -46。",
    "consequence": "累计实际费用只累加已执行的派车费用，至此为 -87.997。"
  },
  {
    "decision": "把本站 1 辆指派为 站2货类2×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站2货类2”改为“站4货类1”，该期调度费变化 8.0002。",
    "consequence": "改派还会使策略延续成本变化 -1，合计阶段成本变化 7.0002。",
    "comparison": {
      "title": "第 2 期站 2 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -43.9972 加延续成本 -30 为比较基线。"
        },
        {
          "label": "站2货类2 改为 站4货类1",
          "value": 7.000235,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 8.0002，新分布延续成本变化 -1。"
        }
      ],
      "world": {
        "title": "第 2 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_02",
          "location_04"
        ],
        "oldRoute": [
          "location_02",
          "location_02"
        ],
        "oldLabel": "站2货类2",
        "newLabel": "站4货类1",
        "stocks": [
          1,
          1,
          3,
          3
        ],
        "previous": [
          1,
          2,
          3,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 1 辆"
          ],
          [
            "location_03",
            "站 3 · 3 → 3 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 3 辆"
          ]
        ],
        "description": "起点为站 2。灰色虚线为原指派（站2货类2），紫色弧为改派（站4货类1）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 5 辆指派为 站1空车×1、站2货类2×1、站3货类1×1、站4空车×1、站4货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站4空车”改为“站2空车”，该期调度费变化 -1.9998。",
    "consequence": "改派还会使策略延续成本变化 3，合计阶段成本变化 1.0002。",
    "comparison": {
      "title": "第 2 期站 3 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -43.9972 加延续成本 -30 为比较基线。"
        },
        {
          "label": "站4空车 改为 站2空车",
          "value": 1.000238,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 -1.9998，新分布延续成本变化 3。"
        }
      ],
      "world": {
        "title": "第 2 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_03",
          "location_02"
        ],
        "oldRoute": [
          "location_03",
          "location_04"
        ],
        "oldLabel": "站4空车",
        "newLabel": "站2空车",
        "stocks": [
          1,
          3,
          3,
          1
        ],
        "previous": [
          1,
          2,
          3,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 3 辆"
          ],
          [
            "location_03",
            "站 3 · 3 → 3 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 1 辆"
          ]
        ],
        "description": "起点为站 3。灰色虚线为原指派（站4空车），紫色弧为改派（站2空车）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 2 辆指派为 站3货类1×1、站3货类2×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站3货类2”改为“站2货类2”，该期调度费变化 4.9998。",
    "consequence": "改派还会使策略延续成本变化 -3，合计阶段成本变化 1.9998。",
    "comparison": {
      "title": "第 2 期站 4 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -43.9972 加延续成本 -30 为比较基线。"
        },
        {
          "label": "站3货类2 改为 站2货类2",
          "value": 1.999824,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 4.9998，新分布延续成本变化 -3。"
        }
      ],
      "world": {
        "title": "第 2 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_04",
          "location_02"
        ],
        "oldRoute": [
          "location_04",
          "location_03"
        ],
        "oldLabel": "站3货类2",
        "newLabel": "站2货类2",
        "stocks": [
          1,
          3,
          2,
          2
        ],
        "previous": [
          1,
          2,
          3,
          2
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 3 辆"
          ],
          [
            "location_03",
            "站 3 · 3 → 2 辆"
          ],
          [
            "location_04",
            "站 4 · 2 → 2 辆"
          ]
        ],
        "description": "起点为站 4。灰色虚线为原指派（站3货类2），紫色弧为改派（站2货类2）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把全站调度同时按目的地汇总为下一状态 1、2、3、2。",
    "evidence": "合计 8 辆。本期派车费用 -43.9972，评估本期动作时另计延续成本 -30。",
    "consequence": "累计实际费用只累加已执行的派车费用，至此为 -131.9942。"
  },
  {
    "decision": "把本站 1 辆指派为 站1货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站1货类1”改为“站2货类2”，该期调度费变化 3.0002。",
    "consequence": "改派还会使策略延续成本变化 0，合计阶段成本变化 3.0002。",
    "comparison": {
      "title": "第 3 期站 1 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -94.9961 加延续成本 -19 为比较基线。"
        },
        {
          "label": "站1货类1 改为 站2货类2",
          "value": 3.000197,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 3.0002，新分布延续成本变化 0。"
        }
      ],
      "world": {
        "title": "第 3 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_01",
          "location_02"
        ],
        "oldRoute": [
          "location_01",
          "location_01"
        ],
        "oldLabel": "站1货类1",
        "newLabel": "站2货类2",
        "stocks": [
          0,
          3,
          2,
          3
        ],
        "previous": [
          1,
          2,
          2,
          3
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 0 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 3 辆"
          ],
          [
            "location_03",
            "站 3 · 2 → 2 辆"
          ],
          [
            "location_04",
            "站 4 · 3 → 3 辆"
          ]
        ],
        "description": "起点为站 1。灰色虚线为原指派（站1货类1），紫色弧为改派（站2货类2）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 2 辆指派为 站2货类2×1、站4货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站2货类2”改为“站2货类1”，该期调度费变化 4.9991。",
    "consequence": "改派还会使策略延续成本变化 0，合计阶段成本变化 4.9991。",
    "comparison": {
      "title": "第 3 期站 2 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -94.9961 加延续成本 -19 为比较基线。"
        },
        {
          "label": "站2货类2 改为 站2货类1",
          "value": 4.999146,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 4.9991，新分布延续成本变化 0。"
        }
      ],
      "world": {
        "title": "第 3 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_02",
          "location_02"
        ],
        "oldRoute": [
          "location_02",
          "location_02"
        ],
        "oldLabel": "站2货类2",
        "newLabel": "站2货类1",
        "stocks": [
          1,
          2,
          2,
          3
        ],
        "previous": [
          1,
          2,
          2,
          3
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 2 辆"
          ],
          [
            "location_03",
            "站 3 · 2 → 2 辆"
          ],
          [
            "location_04",
            "站 4 · 3 → 3 辆"
          ]
        ],
        "description": "起点为站 2。灰色虚线为原指派（站2货类2），紫色弧为改派（站2货类1）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 3 辆指派为 站3货类1×1、站4空车×2。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站4空车”改为“站1空车”，该期调度费变化 3.0003。",
    "consequence": "改派还会使策略延续成本变化 -1，合计阶段成本变化 2.0003。",
    "comparison": {
      "title": "第 3 期站 3 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -94.9961 加延续成本 -19 为比较基线。"
        },
        {
          "label": "站4空车 改为 站1空车",
          "value": 2.000329,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 3.0003，新分布延续成本变化 -1。"
        }
      ],
      "world": {
        "title": "第 3 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_03",
          "location_01"
        ],
        "oldRoute": [
          "location_03",
          "location_04"
        ],
        "oldLabel": "站4空车",
        "newLabel": "站1空车",
        "stocks": [
          2,
          2,
          2,
          2
        ],
        "previous": [
          1,
          2,
          2,
          3
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 2 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 2 辆"
          ],
          [
            "location_03",
            "站 3 · 2 → 2 辆"
          ],
          [
            "location_04",
            "站 4 · 3 → 2 辆"
          ]
        ],
        "description": "起点为站 3。灰色虚线为原指派（站4空车），紫色弧为改派（站1空车）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把本站 2 辆指派为 站2货类1×1、站3货类1×1。",
    "evidence": "起点逐行分配守恒。若仅把一辆“站3货类1”改为“站4货类2”，该期调度费变化 5。",
    "consequence": "改派还会使策略延续成本变化 1，合计阶段成本变化 6。",
    "comparison": {
      "title": "第 3 期站 4 改派一辆：相对阶段成本增加多少？",
      "options": [
        {
          "label": "保留解中派车",
          "value": 0,
          "unit": "费用差",
          "note": "全期调度费 -94.9961 加延续成本 -19 为比较基线。"
        },
        {
          "label": "站3货类1 改为 站4货类2",
          "value": 5.999988,
          "unit": "费用差",
          "note": "其余分配固定，运单名额允许。调度费变化 5，新分布延续成本变化 1。"
        }
      ],
      "world": {
        "title": "第 3 期 · 改派一辆车",
        "kind": "fleet",
        "valid": true,
        "route": [
          "location_04",
          "location_04"
        ],
        "oldRoute": [
          "location_04",
          "location_03"
        ],
        "oldLabel": "站3货类1",
        "newLabel": "站4货类2",
        "stocks": [
          1,
          2,
          1,
          4
        ],
        "previous": [
          1,
          2,
          2,
          3
        ],
        "locations": [
          "location_01",
          "location_02",
          "location_03",
          "location_04"
        ],
        "marks": [
          [
            "location_01",
            "站 1 · 1 → 1 辆"
          ],
          [
            "location_02",
            "站 2 · 2 → 2 辆"
          ],
          [
            "location_03",
            "站 3 · 2 → 1 辆"
          ],
          [
            "location_04",
            "站 4 · 3 → 4 辆"
          ]
        ],
        "description": "起点为站 4。灰色虚线为原指派（站3货类1），紫色弧为改派（站4货类2）。各站车标按对照方案期末分布显示，共 8 辆。"
      }
    }
  },
  {
    "decision": "把全站调度同时按目的地汇总为下一状态 1、2、2、3。",
    "evidence": "合计 8 辆。本期派车费用 -94.9961，评估本期动作时另计延续成本 -19。",
    "consequence": "累计实际费用只累加已执行的派车费用，至此为 -226.9903。"
  }
];
