window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0182"]=[
  {
    "decision": "Split the 15 unit requirement into two batches of 8 and 7.",
    "evidence": "Maximum of 12 per vehicle, minimum of 2 required, exactly equal to fleet limit of 2.",
    "consequence": "The number of vehicles has been fixed, and the energy consumption can still be changed through grouping, sorting and arc selection, but each arrival must fall within the customer’s time window."
  },
  {
    "decision": "In route 1 go to v1 first and then v0.",
    "evidence": "The last stop time plus waiting and driving are 0.0929, Visit this solution 0.0929, time window [0, 0.0929]. ",
    "consequence": "Going in the opposite direction will be at least late in the time window 0.2382. ",
    "comparison": {
      "title": "If you just change the order of two orders on the same car, how late will you be at least?",
      "options": [
        {
          "label": "v1 → v0",
          "value": 0,
          "unit": "time units",
          "note": "Each station is served according to the earliest time it can reach, and the maximum timeout amount of all time windows is taken."
        },
        {
          "label": "v0 → v1",
          "value": 0.238176,
          "unit": "time units",
          "note": "Cars and demand remain unchanged, starting from the same warehouse time; reversing the order will exceed the latest time of v1 by 0.0929."
        }
      ],
      "world": {
        "title": "Route 1 Reverse Order · Time Window Conflict",
        "kind": "route",
        "valid": false,
        "route": [
          "depot",
          "v0",
          "v1"
        ],
        "marks": [
          [
            "v0",
            "1 · Early 0.235 / End 0.2887"
          ],
          [
            "v1",
            "2 · Early 0.3311 / End 0.0929"
          ]
        ],
        "description": "Keep the vehicle, cargo loading and warehouse exit time, and exchange the order of accessing v1 and v0. Going in the opposite direction will be at least 0.2382 later in the time window."
      }
    }
  },
  {
    "decision": "From v1 to v0 in route 1, complete the last order.",
    "evidence": "The last stop time plus waiting and driving are 0.1887, Visit this solution 0.235, time window [0, 0.2887]. ",
    "consequence": "The arc energy consumption cost 0.5857, Remaining stock after delivery 0, Can be returned to warehouse. "
  },
  {
    "decision": "In route 2 go to v2 then v3.",
    "evidence": "The last stop time plus waiting and driving are 0.2677, Visit this solution 0.3677, time window [0.0677, 0.3677]. ",
    "consequence": "The reverse sequence also satisfies the time window, but the energy consumption of the entire route becomes 3.0021, The original order is 2.7567. ",
    "comparison": {
      "title": "Both access orders satisfy the time window, and the energy consumption of the entire route for the same customer group is compared.",
      "options": [
        {
          "label": "v2 → v3",
          "value": 2.756739,
          "unit": "energy consumption cost",
          "note": "Fixed warehouse and customer group, accumulating three arcs: outgoing warehouse, between two customers and returning to warehouse."
        },
        {
          "label": "v3 → v2",
          "value": 3.002065,
          "unit": "energy consumption cost",
          "note": "When reversing the order, the time window is re-checked according to the earliest serviceable time; the common final time can be waited until the original solution value is obtained."
        }
      ],
      "world": {
        "title": "Route 2 Reverse order · Time window feasible",
        "kind": "route",
        "valid": true,
        "route": [
          "depot",
          "v3",
          "v2",
          "depot"
        ],
        "marks": [
          [
            "v3",
            "1 · Early 0.2389 / End 0.5295"
          ],
          [
            "v2",
            "2 · Early 0.2745 / End 0.3677"
          ]
        ],
        "description": "Keep the vehicle, cargo loading and warehouse departure time, and exchange the order of accessing v2 and v3. The reverse sequence also satisfies the time window, but the energy consumption of the entire route becomes 3.0021, while the original sequence is 2.7567."
      }
    }
  },
  {
    "decision": "Go from v2 to v3 in route 2 and complete the last move.",
    "evidence": "The last stop time plus waiting and driving are 0.4174, Visit this solution 0.4757, time window [0.2295, 0.5295]. ",
    "consequence": "The arc energy consumption cost 0.2581, Remaining stock after delivery 0, Can be returned to warehouse. "
  },
  {
    "decision": "The first line is closed and all the customer’s goods have been delivered.",
    "evidence": "The energy consumption cost of returning to the warehouse at the last station is 1.0531; the energy consumption cost of this route is 2.0219.",
    "consequence": "The two lines use the same terminal time variable of 0.8192, and the sum of all selected arcs is 4.7787."
  },
  {
    "decision": "The 2nd line is closed and all the customer’s goods have been delivered.",
    "evidence": "The energy consumption cost of returning to the warehouse at the last station is 1.145; the energy consumption cost of this route is 2.7567.",
    "consequence": "The two lines use the same terminal time variable of 0.8192, and the sum of all selected arcs is 4.7787."
  }
];
