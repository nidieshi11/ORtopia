window.ORTOPIA_REPLAY_LOGIC=window.ORTOPIA_REPLAY_LOGIC||{};window.ORTOPIA_REPLAY_LOGIC["P0145"]=[
  {
    "decision": "The truck will deliver 3 and 2, the drone will deliver 1, and the three orders will be loaded together.",
    "evidence": "The total load is 5.8828, equal to the truck capacity; customer 2 is not on the airlift list and 3’s demand of 2.5586 exceeds the drone capacity of 2.4306.",
    "consequence": "This car-to-machine plan is 2.029 less than the lowest cost of all ground transportation in the same car.",
    "comparison": {
      "title": "If the same team completes all orders, should drones be used to deliver them?",
      "options": [
        {
          "label": "Vehicle-machine collaboration",
          "value": 15.755025,
          "unit": "Cost",
          "note": "Truck 0 → 3 → 2 → 4; Drone 3 → 1 → 2, the costs of driving, flying, lateness and order rejection are calculated according to the original model."
        },
        {
          "label": "All delivered by truck",
          "value": 17.784068,
          "unit": "Cost",
          "note": "There is also zero rejection; all truck access arrangements are enumerated, and the lowest cost route that satisfies the time domain and includes late penalties is selected 0 → 3 → 1 → 2 → 4."
        }
      ]
    },
    "rendezvous": {
      "launch": 6.431348049712074,
      "delivery": 7.521674022303652,
      "recovery": 9.695680988191643,
      "groundDuration": 2.1679566111544837,
      "truckOnly": {
        "sequence": [
          0,
          3,
          1,
          2,
          4
        ],
        "durations": [
          6.431348049712065,
          1.9470106653421704,
          3.882155296228656,
          5.523553720444742
        ],
        "cost": 17.784067731727635,
        "groundCost": 17.78406773172763
      }
    }
  },
  {
    "decision": "Use customer 3 as both the truck delivery point and the drone takeoff point.",
    "evidence": "The truck arrived at 6.4313, earlier than the cutoff of 14.6509; the drone was still on board at this time.",
    "consequence": "The next section of the truck goes straight to 2, and the drone can go around 1 and be recovered at 2."
  },
  {
    "decision": "Select mission 3 → 1 → 2.",
    "evidence": "Package 2.1815 ≤ load 2.4306, two-stage flight time 3.2643 ≤ endurance 8.0.",
    "consequence": "This flight occupies the only onboard drone, and it cannot be re-acquired until 2 recoveries."
  },
  {
    "decision": "1’s order is fulfilled by a drone while the truck drives to 2.",
    "evidence": "The delivery time is 7.5217, the deadline is 8.4782, and the margin is 0.9565.",
    "consequence": "The late penalty for this order is 0; the drone flies for another 2.174 time units to 2."
  },
  {
    "decision": "At the Customer 2 rendezvous, truck stop times must accommodate the flight spur.",
    "evidence": "It only costs 2.168 to go directly to the ground, and 3.2643 to fly back by drone.",
    "consequence": "The rendezvous is at least 1.0964 later than the direct truck alone; the recorded time of 9.6957 is still before the customer cutoff."
  },
  {
    "decision": "Have the drone fly at the end of 2 that the truck has visited.",
    "evidence": "take off 6.4313＋Round trip segment 3.2643＝Recycle 9.6957. ",
    "consequence": "The two branches are connected at the same node, and the remaining road sections 2 → 4 Can be completed with the car. "
  },
  {
    "decision": "Drive from 2 to end 4 and bring back the drone.",
    "evidence": "The final ground arc took 5.5236; the model gave a return time of 21.6235 and an upper limit of time domain of 21.6235.",
    "consequence": "All three orders have been allocated and delivered on schedule; ground charges are calculated based on the selected arc and have nothing to do with additional waiting."
  },
  {
    "decision": "Aggregate costs for truck arcs and drone missions separately.",
    "evidence": "truck cost 14.1229＋drone cost 1.6322, Late and rejected order fees are 0. ",
    "consequence": "total cost 15.755, The comparison fee for all ground delivery is 17.7841. ",
    "comparison": {
      "title": "If the same team completes all orders, should drones be used to deliver them?",
      "options": [
        {
          "label": "Vehicle-machine collaboration",
          "value": 15.755025,
          "unit": "Cost",
          "note": "Truck 0 → 3 → 2 → 4; Drone 3 → 1 → 2, the costs of driving, flying, lateness and order rejection are calculated according to the original model."
        },
        {
          "label": "All delivered by truck",
          "value": 17.784068,
          "unit": "Cost",
          "note": "There is also zero rejection; all truck access arrangements are enumerated, and the lowest cost route that satisfies the time domain and includes late penalties is selected 0 → 3 → 1 → 2 → 4."
        }
      ]
    }
  }
];
