window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0094"]=[
  {
    "decision": "Combine C1a and C1b into one trip, collecting C1a first.",
    "evidence": "The total of the two orders is 17, and the capacity is 17. Total requirement 34 divided into at least 2 trips.",
    "consequence": "If the two stations are exchanged, C1a will be delayed by 5 time units at the earliest.",
    "comparison": {
      "title": "If the order of pick-up points for the same batch is changed, how late will C1a arrive?",
      "options": [
        {
          "label": "C1a → C1b",
          "value": 0,
          "unit": "time units",
          "note": "Press solution time 9 to serve C1a, which is in the allowed time window."
        },
        {
          "label": "C1b → C1a",
          "value": 5,
          "unit": "time units",
          "note": "At the same exit time, the service is based on the earliest possible time in the reverse direction, which is 17 when arriving at C1a, exceeding its latest time of 12."
        }
      ],
      "world": {
        "title": "Picking up goods in reverse order · Time window inspection",
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
            "① Start 11"
          ],
          [
            "C1a",
            "② Early 17/End 12"
          ]
        ],
        "description": "Fixed exit time 0 and two customers of this trip, calculated in reverse order. The red dotted line ends at the first overdue customer."
      }
    }
  },
  {
    "decision": "Run 1 places C1a at station 1 and loads 9.",
    "evidence": "Starting from 0, the earliest work can be started is 9; if 9 is selected, the latest is 12.",
    "consequence": "After loading 9/17, service lasts 1, no departure until 10 at the earliest."
  },
  {
    "decision": "Run 1 queues C1b at station 2 and loads 8.",
    "evidence": "From C1a construction can start as early as 13; if 13 is selected, the latest is 15.",
    "consequence": "After loading 17/17, service lasts 3, departure until 16 at the earliest."
  },
  {
    "decision": "Arrange 17 units of cargo in unloading positions 25 to 30.",
    "evidence": "The vehicle returns at 25 and needs to be unloaded for 4.25 time units, each full time slot is 5 long.",
    "consequence": "Occupy an unloading space after waiting 0; the distance of this trip is 21."
  },
  {
    "decision": "Combine C2a and C2b into one trip, collecting C2a first.",
    "evidence": "The total of the two orders is 17, and the capacity is 17. Total requirement 34 divided into at least 2 trips.",
    "consequence": "If the two stations are exchanged, C2a will be 7 time units later at the earliest.",
    "comparison": {
      "title": "If the order of pick-up points for the same batch is changed, how late will C2a arrive?",
      "options": [
        {
          "label": "C2a → C2b",
          "value": 0,
          "unit": "time units",
          "note": "Press solution time 34 to serve C2a, which is in the allowed time window."
        },
        {
          "label": "C2b → C2a",
          "value": 7,
          "unit": "time units",
          "note": "At the same exit time, the reverse service is based on the earliest feasible time, which is 42 when arriving at C2a, exceeding its latest time of 35."
        }
      ],
      "world": {
        "title": "Picking up goods in reverse order · Time window inspection",
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
            "① Start 38"
          ],
          [
            "C2a",
            "② Earliest 42 / End 35"
          ]
        ],
        "description": "The fixed exit time 25 and the two customers on this trip are calculated in reverse order. The red dotted line ends at the first overdue customer."
      }
    }
  },
  {
    "decision": "Release vehicles and unloading bays at the end of the reservation 30.",
    "evidence": "The parking lot can unload 1 vehicle at the same time, and the two reservations are 25–30 and 50–55 respectively.",
    "consequence": "This trip covers C1a → C1b; the sum of the distances of the two trips is 42."
  },
  {
    "decision": "Run 2 places C2a at station 1 and loads 8.",
    "evidence": "Starting from 0, the earliest possible start is 34; if 34 is selected, the latest is 35.",
    "consequence": "Loaded 8/17, service lasts 2, departure no later than 36."
  },
  {
    "decision": "Trip 2 places C2b at station 2 and loads 9.",
    "evidence": "From C2a, the earliest construction can start is 39; if 39 is selected, the latest is 39.",
    "consequence": "After loading 17/17, service lasts 1, no departure until 40 at the earliest."
  },
  {
    "decision": "Arrange 17 units of cargo at unloading positions 50 to 55.",
    "evidence": "The vehicle returns at 49 and needs to be unloaded for 4.25 time units, each full time slot is 5 long.",
    "consequence": "Wait for 1 and then occupy an unloading space; the distance of this trip is 21."
  },
  {
    "decision": "Release vehicles and unloading bays at the end of the reservation 55.",
    "evidence": "The parking lot can unload 1 vehicle at the same time, and the two reservations are 25–30 and 50–55 respectively.",
    "consequence": "This trip covers C2a → C2b; the sum of the distances of the two trips is 42."
  }
];
