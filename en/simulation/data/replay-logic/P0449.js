window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0449"]=[
  {
    "decision": "The 8 vehicles are distributed by stations as 4, 0, 3, and 1.",
    "evidence": "Each vehicle can only be assigned to one destination and one cargo type in this period; empty vehicles also occupy vehicle quotas.",
    "consequence": "Both loading and empty driving will change the available vehicles at each station in the next period, and the strategy will include the continuation cost of the new distribution in addition to the current dispatching fee."
  },
  {
    "decision": "The 4 vehicles at this station are assigned as station 3 empty truck × 2, station 3 cargo category 1 x 1, and station 3 cargo category 2 x 1.",
    "evidence": "The starting point is assigned row by row conservation. If only one ”empty train at Station 3” is changed to ”Station 4 Cargo Category 1”, the dispatch fee for this period will change by -1.9998.",
    "consequence": "Reassignment also results in a strategy continuation cost change of 3, totaling a stage cost change of 1.0002.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 1 in Phase 1: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -87.997 plus the continuation cost -46 is the baseline for comparison."
        },
        {
          "label": "Empty train at station 3 changed to cargo category 1 at station 4",
          "value": 1.000163,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The scheduling fee changes by -1.9998, and the new distribution continuation cost changes by 3."
        }
      ],
      "world": {
        "title": "Issue 1 · Reassign a vehicle",
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
        "oldLabel": "Station 3 empty train",
        "newLabel": "Station 4 Cargo Category 1",
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
            "Station 1 · 0 → 0 cars"
          ],
          [
            "location_02",
            "Station 2 · 1 → 1 car"
          ],
          [
            "location_03",
            "Station 3 · 5 → 4 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 3 cars"
          ]
        ],
        "description": "The starting point is station 1. The gray dotted line is the original assignment (empty truck at station 3), and the purple arc is the reassignment (cargo category 1 at station 4). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign the 3 vehicles of this station to station 2 cargo category 1×1, station 3 cargo category 2×1, and station 4 cargo category 1×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 4 Cargo Category 1” is changed to ”Station 1 Cargo Category 2”, the dispatch fee for this period will change by 1.0001.",
    "consequence": "Reassignment also results in a strategy continuation cost change of 5, for a total stage cost change of 6.0001.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 3 in Phase 1: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -87.997 plus the continuation cost -46 is the baseline for comparison."
        },
        {
          "label": "Station 4 Cargo Category 1 is changed to Station 1 Cargo Category 2",
          "value": 6.000124,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The dispatch fee changes by 1.0001, and the new distribution continuation cost changes by 5."
        }
      ],
      "world": {
        "title": "Issue 1 · Reassign a vehicle",
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
        "oldLabel": "Station 4 Cargo Category 1",
        "newLabel": "Station 1 Cargo Category 2",
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
            "Station 1 · 0 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 1 → 1 car"
          ],
          [
            "location_03",
            "Station 3 · 5 → 5 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 1 car"
          ]
        ],
        "description": "The starting point is station 3. The gray dotted line represents the original assignment (Station 4 Cargo Category 1), and the purple arc represents the reassignment (Station 1 Cargo Category 2). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign 1 vehicle of this station as station 4 cargo category 1×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 4 Cargo Category 1” is changed to ”Station 3 Cargo Category 1”, the dispatch fee for this period will change by 4.",
    "consequence": "Reassignment also causes the strategy’s continuation cost to change by 0 and the total stage cost to change by 4.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 4 in Phase 1: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -87.997 plus the continuation cost -46 is the baseline for comparison."
        },
        {
          "label": "Station 4 Cargo Category 1 is changed to Station 3 Cargo Category 1",
          "value": 3.999953,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The scheduling fee changes by 4, and the new distribution continuation cost changes by 0."
        }
      ],
      "world": {
        "title": "Issue 1 · Reassign a vehicle",
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
        "oldLabel": "Station 4 Cargo Category 1",
        "newLabel": "Station 3 Cargo Category 1",
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
            "Station 1 · 0 → 0 cars"
          ],
          [
            "location_02",
            "Station 2 · 1 → 1 car"
          ],
          [
            "location_03",
            "Station 3 · 5 → 6 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 1 car"
          ]
        ],
        "description": "The starting point is station 4. The gray dotted line is the original assignment (Station 4 Cargo Category 1), and the purple arc is the reassignment (Station 3 Cargo Category 1). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Summarize the whole station dispatching to the next status 0, 1, 5, 2 by destination at the same time.",
    "evidence": "Total 8 vehicles. The cost of dispatching the vehicle in this period is -87.997, and the continuation cost of -46 will be added when evaluating the actions of this period.",
    "consequence": "The accumulated actual cost only accumulates the dispatch costs that have been executed, and is now -87.997."
  },
  {
    "decision": "Assign 1 vehicle of this station as station 2 cargo category 2×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 2 Cargo Category 2” is changed to ”Station 4 Cargo Category 1”, the dispatch fee for this period will change by 8.0002.",
    "consequence": "Reassignment also changes the strategy continuation cost by -1, for a total stage cost change of 7.0002.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 2 in Phase 2: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -43.9972 plus the continuation cost -30 is the baseline for comparison."
        },
        {
          "label": "Station 2 Cargo Category 2 is changed to Station 4 Cargo Category 1",
          "value": 7.000235,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The dispatch fee changes by 8.0002, and the new distribution continuation cost changes by -1."
        }
      ],
      "world": {
        "title": "Issue 2 · Reassign a vehicle",
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
        "oldLabel": "Station 2 Cargo Category 2",
        "newLabel": "Station 4 Cargo Category 1",
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
            "Station 1 · 1 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 2 → 1 car"
          ],
          [
            "location_03",
            "Station 3 · 3 → 3 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 3 cars"
          ]
        ],
        "description": "The starting point is station 2. The gray dotted line is the original assignment (Station 2 Cargo Category 2), and the purple arc is the reassignment (Station 4 Cargo Category 1). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign the 5 vehicles at this station as station 1 empty vehicle × 1, station 2 cargo type 2 × 1, station 3 cargo type 1 × 1, station 4 empty vehicle × 1, and station 4 cargo type 1 × 1.",
    "evidence": "The starting point is assigned row by row conservation. If only one ”empty train at station 4” is changed to ”empty train at station 2”, the dispatch fee for the period will change by -1.9998.",
    "consequence": "Reassignment also results in a strategy continuation cost change of 3, totaling a stage cost change of 1.0002.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 3 in Phase 2: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -43.9972 plus the continuation cost -30 is the baseline for comparison."
        },
        {
          "label": "Station 4 empty train changed to station 2 empty train",
          "value": 1.000238,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The scheduling fee changes by -1.9998, and the new distribution continuation cost changes by 3."
        }
      ],
      "world": {
        "title": "Issue 2 · Reassign a vehicle",
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
        "oldLabel": "Station 4 is empty",
        "newLabel": "Station 2 empty train",
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
            "Station 1 · 1 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 2 → 3 cars"
          ],
          [
            "location_03",
            "Station 3 · 3 → 3 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 1 car"
          ]
        ],
        "description": "The starting point is station 3. The gray dotted line is the original assignment (station 4 is empty), and the purple arc is the reassignment (station 2 is empty). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign the 2 vehicles at this station as station 3 cargo category 1×1 and station 3 cargo category 2×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 3 Cargo Category 2” is changed to ”Station 2 Cargo Category 2”, the dispatch fee for this period will change by 4.9998.",
    "consequence": "Reassignment also changes the strategy’s continuation cost by -3, for a total stage cost change of 1.9998.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 4 in Phase 2: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -43.9972 plus the continuation cost -30 is the baseline for comparison."
        },
        {
          "label": "Station 3 Cargo Category 2 is changed to Station 2 Cargo Category 2",
          "value": 1.999824,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The dispatch fee changes by 4.9998, and the new distribution continuation cost changes by -3."
        }
      ],
      "world": {
        "title": "Issue 2 · Reassign a vehicle",
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
        "oldLabel": "Station 3 Cargo Category 2",
        "newLabel": "Station 2 Cargo Category 2",
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
            "Station 1 · 1 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 2 → 3 cars"
          ],
          [
            "location_03",
            "Station 3 · 3 → 2 cars"
          ],
          [
            "location_04",
            "Station 4 · 2 → 2 cars"
          ]
        ],
        "description": "The starting point is station 4. The gray dotted line represents the original assignment (Station 3 Cargo Category 2), and the purple arc represents the reassignment (Station 2 Cargo Category 2). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Summarize the whole station dispatching to the next status 1, 2, 3, 2 by destination at the same time.",
    "evidence": "Total 8 vehicles. The cost of dispatching a vehicle in this period is -43.9972, and an additional continuation cost of -30 will be added when evaluating the actions of this period.",
    "consequence": "The accumulated actual cost only accumulates the dispatch costs that have been executed, and is now -131.9942."
  },
  {
    "decision": "Assign 1 vehicle of this station as station 1 cargo category 1×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 1 Cargo Category 1” is changed to ”Station 2 Cargo Category 2”, the dispatch fee for this period will change by 3.0002.",
    "consequence": "Reassignment also results in a strategy continuation cost change of 0, for a total stage cost change of 3.0002.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 1 in Phase 3: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -94.9961 plus the continuation cost -19 is the baseline for comparison."
        },
        {
          "label": "Station 1 Cargo Category 1 is changed to Station 2 Cargo Category 2",
          "value": 3.000197,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The scheduling fee changes by 3.0002, and the new distribution continuation cost changes by 0."
        }
      ],
      "world": {
        "title": "Issue 3 · Reassign a vehicle",
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
        "oldLabel": "Station 1 Cargo Category 1",
        "newLabel": "Station 2 Cargo Category 2",
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
            "Station 1 · 1 → 0 cars"
          ],
          [
            "location_02",
            "Station 2 · 2 → 3 cars"
          ],
          [
            "location_03",
            "Station 3 · 2 → 2 cars"
          ],
          [
            "location_04",
            "Station 4 · 3 → 3 cars"
          ]
        ],
        "description": "The starting point is station 1. The gray dotted line represents the original assignment (Station 1 Cargo Category 1), and the purple arc represents the reassignment (Station 2 Cargo Category 2). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign the 2 vehicles at this station as station 2 cargo category 2×1 and station 4 cargo category 1×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 2 Cargo Category 2” is changed to ”Station 2 Cargo Category 1”, the dispatch fee for this period will change by 4.9991.",
    "consequence": "Reassignment also results in a strategy continuation cost change of 0, for a total stage cost change of 4.9991.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 2 in Phase 3: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -94.9961 plus the continuation cost -19 is the baseline for comparison."
        },
        {
          "label": "Station 2 Cargo Category 2 is changed to Station 2 Cargo Category 1",
          "value": 4.999146,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The scheduling fee changes by 4.9991, and the new distribution continuation cost changes by 0."
        }
      ],
      "world": {
        "title": "Issue 3 · Reassign a vehicle",
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
        "oldLabel": "Station 2 Cargo Category 2",
        "newLabel": "Station 2 Cargo Category 1",
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
            "Station 1 · 1 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 2 → 2 cars"
          ],
          [
            "location_03",
            "Station 3 · 2 → 2 cars"
          ],
          [
            "location_04",
            "Station 4 · 3 → 3 cars"
          ]
        ],
        "description": "The starting point is station 2. The gray dotted line represents the original assignment (Station 2 Cargo Category 2), and the purple arc represents the reassignment (Station 2 Cargo Category 1). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign 3 trucks at this station as 1×1 cargo type at station 3 and 2 empty trucks at station 4.",
    "evidence": "The starting point is assigned row by row conservation. If only one ”empty train at station 4” is changed to ”empty train at station 1”, the dispatch fee for this period will change by 3.0003.",
    "consequence": "Reassignment also changes the strategy continuation cost by -1, for a total stage cost change of 2.0003.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 3 in Phase 3: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -94.9961 plus the continuation cost -19 is the baseline for comparison."
        },
        {
          "label": "Station 4 empty train changed to station 1 empty train",
          "value": 2.000329,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The dispatch fee changes by 3.0003, and the new distribution continuation cost changes by -1."
        }
      ],
      "world": {
        "title": "Issue 3 · Reassign a vehicle",
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
        "oldLabel": "Station 4 is empty",
        "newLabel": "Station 1 is empty",
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
            "Station 1 · 1 → 2 cars"
          ],
          [
            "location_02",
            "Station 2 · 2 → 2 cars"
          ],
          [
            "location_03",
            "Station 3 · 2 → 2 cars"
          ],
          [
            "location_04",
            "Station 4 · 3 → 2 cars"
          ]
        ],
        "description": "The starting point is station 3. The gray dotted line is the original assignment (station 4 is empty), and the purple arc is the reassignment (station 1 is empty). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Assign the 2 vehicles at this station as station 2 cargo category 1×1 and station 3 cargo category 1×1.",
    "evidence": "The starting point is assigned row by row conservation. If only one vehicle ”Station 3 Cargo Category 1” is changed to ”Station 4 Cargo Category 2”, the dispatch fee for this period will change by 5.",
    "consequence": "Reassignment also causes the strategy to have a continuation cost change of 1 and a total stage cost change of 6.",
    "comparison": {
      "title": "Reassigning one vehicle to Station 4 in Phase 3: How much will the relative phase cost increase?",
      "options": [
        {
          "label": "Keep the reference dispatch",
          "value": 0,
          "unit": "Cost difference",
          "note": "The full period dispatch fee -94.9961 plus the continuation cost -19 is the baseline for comparison."
        },
        {
          "label": "Station 3 Cargo Category 1 is changed to Station 4 Cargo Category 2",
          "value": 5.999988,
          "unit": "Cost difference",
          "note": "The rest of the allocation is fixed and the waybill quota is available. The dispatch fee changes by 5, and the new distribution continuation cost changes by 1."
        }
      ],
      "world": {
        "title": "Issue 3 · Reassign a vehicle",
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
        "oldLabel": "Station 3 Cargo Category 1",
        "newLabel": "Station 4 Cargo Category 2",
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
            "Station 1 · 1 → 1 car"
          ],
          [
            "location_02",
            "Station 2 · 2 → 2 cars"
          ],
          [
            "location_03",
            "Station 3 · 2 → 1 car"
          ],
          [
            "location_04",
            "Station 4 · 3 → 4 cars"
          ]
        ],
        "description": "The starting point is station 4. The gray dotted line is the original assignment (Station 3 Cargo Category 1), and the purple arc is the reassignment (Station 4 Cargo Category 2). The vehicle logos at each station are displayed according to the distribution at the end of the control plan, with a total of 8 vehicles."
      }
    }
  },
  {
    "decision": "Summarize the whole station scheduling into the next states 1, 2, 2, and 3 by destination at the same time.",
    "evidence": "Total 8 vehicles. The cost of dispatching the vehicle in this period is -94.9961, and the continuation cost of -19 will be added when evaluating the actions of this period.",
    "consequence": "The accumulated actual cost only accumulates the dispatch costs that have been executed, and is now -226.9903."
  }
];
