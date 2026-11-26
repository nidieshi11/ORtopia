window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0122"]=[
  {
    "decision": "Assign customers 1 and 4 to route 1.",
    "evidence": "Demand 7＋3＝10; All requirements 20, only 2 vehicles, capacity of each vehicle 10.",
    "consequence": "Both cars must be fully loaded. If you put 1 and 3 If combined, it will be overloaded. 5.",
    "comparison": {
      "title": "How much capacity will be occupied when two orders are placed in the same vehicle? Upper limit 10",
      "options": [
        {
          "label": "Customer 1＋4",
          "value": 10,
          "unit": "cargo unit",
          "note": "This route happens to be fully loaded, and another car has two remaining orders."
        },
        {
          "label": "Customer 1＋3",
          "value": 15,
          "unit": "cargo unit",
          "note": "Just replacing the customer mix exceeds the bike capacity 5, This set of allocations cannot be used."
        }
      ],
      "world": {
        "title": "Consolidate customer orders · Loading inspection",
        "kind": "cargo",
        "valid": false,
        "route": [],
        "origin": "0",
        "clients": [
          "1",
          "3"
        ],
        "amounts": [
          7,
          8
        ],
        "capacity": 10,
        "marks": [
          [
            "1",
            "Customer 1 · 7 units"
          ],
          [
            "3",
            "Customers 3 · 8 units"
          ]
        ],
        "description": "Put all orders from both customers into the same car. The cargo space in the warehouse is divided into 10 units with a single vehicle capacity. 5 units exceeding the capacity mark cannot be loaded."
      }
    }
  },
  {
    "decision": "From 0 to 1, deliver all 7 units required by this customer.",
    "evidence": "The distance of selected arc 0 → 1 is 2.4405, and 2.4405 has been traveled so far.",
    "consequence": "Vehicle remaining stock 3, just left for customer 4."
  },
  {
    "decision": "From 1 to 4, deliver all 3 units required by this customer.",
    "evidence": "The distance of selected arc 1 → 4 is 3.8122, and 6.2527 has been traveled so far.",
    "consequence": "The remaining inventory of the vehicle is 0. The two orders assigned to the vehicle have been delivered and can be returned to the warehouse."
  },
  {
    "decision": "The empty car returns to the warehouse from 4, closing the route.",
    "evidence": "Calculating the return trip based on coordinates is 4.4916, and the total length of this route is 10.7443.",
    "consequence": "The two vehicles cover different customers; the sum of the charges for the two closed routes is 24.2728."
  },
  {
    "decision": "Assign customers 2 and 3 to route 2.",
    "evidence": "Demand 2＋8＝10; All requirements 20, only 2 vehicles, capacity of each vehicle 10.",
    "consequence": "Both cars must be fully loaded. If you put 3 and 1 If combined, it will be overloaded. 5.",
    "comparison": {
      "title": "How much capacity will be occupied when two orders are placed in the same vehicle? Upper limit 10",
      "options": [
        {
          "label": "Customer 2＋3",
          "value": 10,
          "unit": "cargo unit",
          "note": "This route happens to be fully loaded, and another car has two remaining orders."
        },
        {
          "label": "Customer 3＋1",
          "value": 15,
          "unit": "cargo unit",
          "note": "Just replacing the customer mix exceeds the bike capacity 5, This set of allocations cannot be used."
        }
      ],
      "world": {
        "title": "Consolidate customer orders · Loading inspection",
        "kind": "cargo",
        "valid": false,
        "route": [],
        "origin": "0",
        "clients": [
          "3",
          "1"
        ],
        "amounts": [
          8,
          7
        ],
        "capacity": 10,
        "marks": [
          [
            "3",
            "Customers 3 · 8 units"
          ],
          [
            "1",
            "Customer 1 · 7 units"
          ]
        ],
        "description": "Put all orders from both customers into the same car. The cargo space in the warehouse is divided into 10 units with a single vehicle capacity. 5 units exceeding the capacity mark cannot be loaded."
      }
    }
  },
  {
    "decision": "From 0 to 2, deliver all 2 units required by this customer.",
    "evidence": "The distance of selected arc 0 → 2 is 1.3449, and 1.3449 has been traveled so far.",
    "consequence": "The remaining stock of the vehicle is 8, leaving exactly 3 for the customer."
  },
  {
    "decision": "From 2 to 3, deliver all 8 units required by this customer.",
    "evidence": "The distance of selected arc 2 → 3 is 5.7938, and 7.1387 has been traveled so far.",
    "consequence": "The remaining inventory of the vehicle is 0. The two orders assigned to the vehicle have been delivered and can be returned to the warehouse."
  },
  {
    "decision": "The empty car returns to the warehouse from 3, closing the route.",
    "evidence": "Calculating the return trip based on coordinates is 6.3899, and the total length of this route is 13.5286.",
    "consequence": "The two vehicles cover different customers; the sum of the charges for the two closed routes is 24.2728."
  }
];
