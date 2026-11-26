window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0160"]=[
  {
    "decision": "Allocate two customer pairs according to area and load, and then select the power supply stop for each vehicle.",
    "evidence": "V0 is responsible for B0 and A0 (6/6); V1 is responsible for B1 and A1 (5/5).",
    "consequence": "The capacity of both vehicles is exhausted; there is only one optional charging station in each area, and the access sequence must meet both the battery capacity and the return time limit."
  },
  {
    "decision": "Serve B0 first, and leave A0 in the same area until the power is replenished.",
    "evidence": "The current battery level is 5. It takes 7 to drive directly from B0 to A0, which is short of 2; it only needs 3 to go to F0.",
    "consequence": "Turn to the charging station, the estimated power at the station is 2."
  },
  {
    "decision": "Serve B1 first, and leave A1 in the same area until the power is replenished.",
    "evidence": "The current battery capacity is 6. It takes 7 to drive directly from B1 to A1, which is short of 1; only 3 is needed to get to F1.",
    "consequence": "Turning to the charging station, the estimated power at the station is 3."
  },
  {
    "decision": "Replenish 3 units at F0 and continue serving A0.",
    "evidence": "The remaining power at the station is 2, and the subsequent two sections require 5; the effective power is 4, and the replenishment time is 0.75.",
    "consequence": "After recharging, the power will just cover the subsequent journey. If you recharge less along the original route, you will not be able to return to the warehouse.",
    "comparison": {
      "title": "Keep F0 → A0 → Return to warehouse. Is the current battery enough to finish the journey?",
      "options": [
        {
          "label": "Use solution to replenish power",
          "value": 0,
          "unit": "Electricity unit",
          "note": "The indicator is the gap between the amount of electricity required to return to the position. Arrive at station 2, recharge 3, and consume 5 power for the remaining two sections."
        },
        {
          "label": "No recharge this time",
          "value": 3.0,
          "unit": "Electricity unit",
          "note": "The rest of the driving arc remains unchanged, and there is a shortage of 3 units of electricity before returning to the warehouse."
        }
      ],
      "world": {
        "title": "V0 skips power replenishment and returns to warehouse balance inspection",
        "kind": "energy",
        "valid": false,
        "route": [
          "F0",
          "A0",
          "__end"
        ],
        "truck": "A0",
        "marks": [
          [
            "F0",
            "Skip charging · remaining 2"
          ],
          [
            "A0",
            "Arrival Yudian 0"
          ],
          [
            "__end",
            "Return to warehouse 3"
          ]
        ],
        "description": "The rest of the road remains as is. V0 can go from F0 to A0, and returning from A0 requires 3 units of electricity. The red dotted line marks the low-battery arc."
      }
    }
  },
  {
    "decision": "Add 1 unit at F1 and continue serving A1.",
    "evidence": "The remaining power at the station is 3, and the next two sections require 4; the effective power is 4, and the replenishment time is 0.25.",
    "consequence": "After recharging, the power will just cover the subsequent journey. If you recharge less along the original route, you will not be able to return to the warehouse.",
    "comparison": {
      "title": "Keep F1 → A1 → Return to warehouse. Is the battery enough to finish the journey?",
      "options": [
        {
          "label": "Use solution to replenish power",
          "value": 0,
          "unit": "Electricity unit",
          "note": "The indicator is the gap between the amount of electricity required to return to the position. Arrive at station 3, add 1, and the remaining two sections consume 4."
        },
        {
          "label": "No recharge this time",
          "value": 1.0,
          "unit": "Electricity unit",
          "note": "The rest of the driving arc remains unchanged, and there is a shortage of 1 unit of electricity before returning to the warehouse."
        }
      ],
      "world": {
        "title": "V1 skips power replenishment and returns to warehouse balance inspection",
        "kind": "energy",
        "valid": false,
        "route": [
          "F1",
          "A1",
          "__end"
        ],
        "truck": "A1",
        "marks": [
          [
            "F1",
            "Skip charging · remaining 3"
          ],
          [
            "A1",
            "Arrive at Yudian 1"
          ],
          [
            "__end",
            "Return to warehouse 1"
          ]
        ],
        "description": "The rest of the road remains as is. V1 can go from F1 to A1, and returning from A1 requires 2 units of electricity. The red dotted line marks the low-battery arc."
      }
    }
  },
  {
    "decision": "From F1 to A1, complete the last order in this area.",
    "evidence": "After recharging 4, this section consumes 2, and there are 2 left when arriving.",
    "consequence": "It still takes 2 to return to the warehouse; the vehicle can be returned to the warehouse directly after completing the order."
  },
  {
    "decision": "From F0 to A0, complete the last order in this area.",
    "evidence": "After recharging 5, this section consumes 2, and there are 3 left when arriving.",
    "consequence": "It takes 3 days to return to the warehouse; the vehicle can be returned to the warehouse directly after completing the order."
  },
  {
    "decision": "Close the route before the two deadlines of returning to the position and completing terminal power replenishment.",
    "evidence": "The return time is 6.25 ≤ 11, the battery reaches 0, and the terminal target is 8.",
    "consequence": "In the warehouse, the power is 4 to make up for the required 2. The terminal target can be reached at 8.25 at the earliest and ends at 15."
  },
  {
    "decision": "Close the route before the two deadlines of returning to the position and completing terminal power replenishment.",
    "evidence": "The return time is 6.75 ≤ 11, the battery level is 0, and the terminal target is 8.",
    "consequence": "In the warehouse, the power is 4 to make up for the required 2. The terminal target can be reached at 8.75 at the earliest and ends at 15."
  }
];
