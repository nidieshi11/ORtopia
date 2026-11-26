window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0177"]=[
  {
    "decision": "Give the c4 package to the robot and the truck serves the remaining 4 people.",
    "evidence": "The robot can only hold 1 piece. After splitting, the truck took 547.7283 seconds, and the robot including loading and unloading took 411.4056 seconds.",
    "consequence": "A saving of 110.3123 seconds relative to the given full truck baseline.",
    "comparison": {
      "title": "How long does it take for the same batch of five packages to depart from the warehouse and return to the warehouse?",
      "options": [
        {
          "label": "Selected collaboration plan",
          "value": 547.728262,
          "unit": "s",
          "note": "The truck is responsible for c5 → c1 → c2 → c3, the robot is responsible for c4, and the completion time is the later of the two."
        },
        {
          "label": "All truck baseline routes",
          "value": 658.040597,
          "unit": "s",
          "note": "Solve the attached departure route according to the example: warehouse → c4 → c5 → c1 → c2 → c3 → warehouse, convert the time arc by arc and add service time to each customer."
        }
      ],
      "world": {
        "title": "All delivered by truck · Complete route",
        "kind": "route",
        "valid": true,
        "route": [
          "depot",
          "c4",
          "c5",
          "c1",
          "c2",
          "c3",
          "depot"
        ],
        "marks": [
          [
            "c4",
            "1 · c4"
          ],
          [
            "c5",
            "2 · c5"
          ],
          [
            "c1",
            "3 · c1"
          ],
          [
            "c2",
            "4 · c2"
          ],
          [
            "c3",
            "5 · c3"
          ]
        ],
        "robotAboard": "c4",
        "description": "The robot accompanies the truck throughout the entire journey, and the c4 originally given to the robot was changed to a truck stop. In truck baseline sequence, 40 seconds of service are added to each delivery point."
      }
    }
  },
  {
    "decision": "The package is delivered by truck along warehouse → c5, then on to c1.",
    "evidence": "The arc length is 1.6899 km, which translates to 173.8166 seconds at 35 km/h; it takes another 40 seconds at the customer’s location.",
    "consequence": "After the 1/4th customer of this line completes the service, the truck can continue at the earliest 213.8166 seconds; there are still 3 customers left in the truck’s line."
  },
  {
    "decision": "The robot delivers the package along warehouse → c4 and then goes to the warehouse.",
    "evidence": "Arc length 0.3627 km, converted to 163.2028 seconds at 8 km/h; another 40 seconds at the customer’s location.",
    "consequence": "After the 1/1st main line customer completes the service, the robot can continue at the earliest 223.2028 seconds; the other main line will deliver goods simultaneously."
  },
  {
    "decision": "Packages are delivered by truck along c5 → c1, then on to c2.",
    "evidence": "The arc length is 0.2965 km, which translates to 30.4988 seconds at 35 km/h; it takes another 40 seconds at the customer’s location.",
    "consequence": "After the 2/4th customer on this line completes the service, the truck can continue at the earliest 284.3154 seconds; there are 2 customers left on the truck’s line."
  },
  {
    "decision": "The package is delivered by truck along c1 → c2, then on to c3.",
    "evidence": "The arc length is 0.6044 km, which translates to 62.1671 seconds at 35 km/h; it takes another 40 seconds at the customer’s location.",
    "consequence": "After the 3/4th customer on this line completes the service, the truck can continue at the earliest 386.4825 seconds; there is still 1 customer left on the truck’s line."
  },
  {
    "decision": "Let the robot complete recycling and unloading at a common end point.",
    "evidence": "It takes 386.4056 seconds to return to the warehouse, plus 25 seconds for unloading, and the branch line totals 411.4056 seconds.",
    "consequence": "The robot finishes first, with 136.3227 seconds left before the truck is finished."
  },
  {
    "decision": "The parcel is delivered by truck along c2 → c3 and then proceeds to the warehouse.",
    "evidence": "The arc length is 0.5754 km, which translates into 59.1816 seconds at 35 km/h; it takes another 40 seconds at the customer’s location.",
    "consequence": "After the 4/4th customer of this line completes the service, the truck can continue at the earliest 485.6641 seconds; there are 0 customers left in the truck’s line."
  },
  {
    "decision": "The truck completes the last section of the main line and joins the robot that has returned to the warehouse.",
    "evidence": "It takes 62.0641 seconds to return to the warehouse from c3; the entire truck route totals 547.7283 seconds.",
    "consequence": "The main line determines the completion time; just shortening the branch that the robot has completed in advance will not complete it in advance."
  },
  {
    "decision": "Take the larger completion time of the two parallel branches.",
    "evidence": "The truck takes 547.7283 seconds and the robot 411.4056 seconds, a difference of 136.3227 seconds.",
    "consequence": "The completion time is calculated as 547.7283 seconds. This example solution provides feasible costs and the baseline comparison covers only the two options listed.",
    "comparison": {
      "title": "How long does it take for the same batch of five packages to depart from the warehouse and return to the warehouse?",
      "options": [
        {
          "label": "Selected collaboration plan",
          "value": 547.728262,
          "unit": "s",
          "note": "The truck is responsible for c5 → c1 → c2 → c3, the robot is responsible for c4, and the completion time is the later of the two."
        },
        {
          "label": "All truck baseline routes",
          "value": 658.040597,
          "unit": "s",
          "note": "Solve the attached departure route according to the example: warehouse → c4 → c5 → c1 → c2 → c3 → warehouse, convert the time arc by arc and add service time to each customer."
        }
      ],
      "world": {
        "title": "All delivered by truck · Complete route",
        "kind": "route",
        "valid": true,
        "route": [
          "depot",
          "c4",
          "c5",
          "c1",
          "c2",
          "c3",
          "depot"
        ],
        "marks": [
          [
            "c4",
            "1 · c4"
          ],
          [
            "c5",
            "2 · c5"
          ],
          [
            "c1",
            "3 · c1"
          ],
          [
            "c2",
            "4 · c2"
          ],
          [
            "c3",
            "5 · c3"
          ]
        ],
        "robotAboard": "c4",
        "description": "The robot accompanies the truck throughout the entire journey, and the c4 originally given to the robot was changed to a truck stop. In truck baseline sequence, 40 seconds of service are added to each delivery point."
      }
    }
  }
];
