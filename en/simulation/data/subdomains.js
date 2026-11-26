window.ORTOPIA_SUBDOMAINS = {
  "01_warehouse_logistics_supply_chain": [
    {
      "key": "freight-delivery",
      "label": "Freight and Delivery",
      "ids": [
        "P0004", "P0007", "P0008", "P0011", "P0028", "P0048", "P0051",
        "P0067", "P0084", "P0094", "P0122", "P0160", "P0163", "P0177",
        "P0182", "P0193", "P0199", "P0278", "P0279", "P0331", "P0347",
        "P0363", "P0411", "P0415", "P0433", "P0443", "P0444", "P0449",
        "P0459", "P0460", "P0461", "P0462", "P0463", "P0494"
      ]
    },
    {
      "key": "warehouse-supply",
      "label": "Warehousing and Supply Chain Planning",
      "ids": [
        "P0024", "P0029", "P0030", "P0036", "P0063", "P0174", "P0183",
        "P0184", "P0414", "P0456", "P0457", "P0471", "P0474", "P0475",
        "P0488", "P0489", "P0490", "P0492", "P0497"
      ]
    }
  ],
  "03_urban_road_transport": [
    {
      "key": "transit-shared-mobility",
      "label": "Public Transit and Shared Mobility",
      "ids": [
        "P0015", "P0019", "P0027", "P0047", "P0052", "P0055", "P0068",
        "P0081", "P0110", "P0111", "P0112", "P0114", "P0123", "P0124",
        "P0148", "P0152", "P0159", "P0173", "P0270", "P0274", "P0348",
        "P0451", "P0481", "P0483", "P0484", "P0495"
      ]
    },
    {
      "key": "road-control",
      "label": "Road Planning and Vehicle Control",
      "ids": [
        "P0190", "P0364", "P0429", "P0442", "P0476", "P0477", "P0479",
        "P0480", "P0482"
      ]
    }
  ]
};

window.ORTOPIA_SCENE_TOPICS = {
  "freight-delivery": [
    {
      "label": "Vehicle Routing and Pickup and Delivery",
      "ids": [
        "P0008", "P0011", "P0048", "P0051", "P0067", "P0084", "P0094",
        "P0122", "P0160", "P0163", "P0182", "P0278", "P0363", "P0415",
        "P0433", "P0459", "P0462", "P0494"
      ]
    },
    {
      "label": "Collaborative and Multistage Delivery",
      "ids": [
        "P0004", "P0177", "P0193", "P0331", "P0347", "P0461", "P0463"
      ]
    },
    {
      "label": "Freight Networks and Capacity",
      "ids": [
        "P0007", "P0028", "P0199", "P0279", "P0411", "P0443", "P0444",
        "P0449", "P0460"
      ]
    }
  ],
  "warehouse-supply": [
    {
      "label": "Procurement, Replenishment and Inventory Routing",
      "ids": [
        "P0024", "P0030", "P0036", "P0183", "P0457", "P0488", "P0489",
        "P0490", "P0492", "P0497"
      ]
    },
    {
      "label": "Warehouse Operations and Facility Design",
      "ids": [
        "P0029", "P0063", "P0174", "P0184", "P0414"
      ]
    },
    {
      "label": "Distribution Contracts and Pricing",
      "ids": [
        "P0456", "P0471", "P0474", "P0475"
      ]
    }
  ],
  "02_industrial_production_scheduling": [
    {
      "label": "Production Planning and Sales Allocation",
      "ids": [
        "P0006", "P0215"
      ]
    },
    {
      "label": "Job Sequencing and Resource Scheduling",
      "ids": [
        "P0020", "P0075", "P0079"
      ]
    }
  ],
  "transit-shared-mobility": [
    {
      "label": "Transit Networks and Timetabling",
      "ids": [
        "P0027", "P0052", "P0110", "P0114", "P0123", "P0124", "P0148",
        "P0159", "P0173", "P0274", "P0348", "P0481"
      ]
    },
    {
      "label": "On-Demand Mobility and Fleet Allocation",
      "ids": [
        "P0015", "P0019", "P0047", "P0055", "P0068", "P0081", "P0111",
        "P0112", "P0152", "P0270", "P0451", "P0483", "P0484", "P0495"
      ]
    }
  ],
  "road-control": [
    {
      "label": "Road Network Design and Signal Timing",
      "ids": [
        "P0190", "P0364", "P0429"
      ]
    },
    {
      "label": "Vehicle Speed and Platoon Control",
      "ids": [
        "P0442", "P0476", "P0477", "P0479", "P0480", "P0482"
      ]
    }
  ],
  "04_urban_rail_transit": [
    {
      "label": "Train Services and Timetabling",
      "ids": [
        "P0151", "P0154", "P0158", "P0360", "P0409", "P0412"
      ]
    },
    {
      "label": "Disruption Recovery and Passenger Rerouting",
      "ids": [
        "P0077", "P0092"
      ]
    }
  ],
  "05_aviation_rail_maritime_ports": [
    {
      "label": "Airline Operations and Revenue Management",
      "ids": [
        "P0046", "P0071", "P0080", "P0161", "P0179", "P0446", "P0447",
        "P0450"
      ]
    },
    {
      "label": "Rail Freight and Track Maintenance",
      "ids": [
        "P0195", "P0353", "P0416", "P0478"
      ]
    },
    {
      "label": "Berth Scheduling and Port Operations",
      "ids": [
        "P0202", "P0204", "P0206"
      ]
    }
  ],
  "06_unmanned_aerial_vehicles": [
    {
      "label": "Coordinated Ground and Drone Delivery",
      "ids": [
        "P0010", "P0041", "P0072", "P0085", "P0145", "P0189", "P0191",
        "P0470"
      ]
    },
    {
      "label": "Drone Bases and Fleet Repositioning",
      "ids": [
        "P0039", "P0164", "P0408"
      ]
    }
  ],
  "07_energy_infrastructure": [
    {
      "label": "Power Dispatch and Electricity Markets",
      "ids": [
        "P0013", "P0026", "P0035", "P0057", "P0062", "P0069", "P0078",
        "P0104", "P0167", "P0168", "P0176", "P0201", "P0209", "P0210",
        "P0438", "P0439"
      ]
    },
    {
      "label": "Energy Infrastructure Investment and Maintenance",
      "ids": [
        "P0034", "P0165", "P0214", "P0436", "P0493"
      ]
    },
    {
      "label": "Water and Gas Network Operations",
      "ids": [
        "P0208", "P0213"
      ]
    }
  ],
  "08_finance_business": [
    {
      "label": "Pricing and Revenue Management",
      "ids": [
        "P0115", "P0445", "P0448", "P0465", "P0466", "P0485", "P0486",
        "P0487", "P0491", "P0496", "P0498", "P0499"
      ]
    },
    {
      "label": "Product Assortment and Marketing",
      "ids": [
        "P0045", "P0095", "P0454", "P0469"
      ]
    },
    {
      "label": "Financial Trading and Contract Incentives",
      "ids": [
        "P0074", "P0169", "P0440", "P0441", "P0455", "P0472", "P0473"
      ]
    }
  ],
  "09_healthcare": [
    {
      "label": "Appointments, Surgery and Care Scheduling",
      "ids": [
        "P0001", "P0012", "P0023", "P0025", "P0087", "P0181", "P0431",
        "P0452"
      ]
    },
    {
      "label": "Disease Prevention and Treatment Planning",
      "ids": [
        "P0053", "P0172", "P0437"
      ]
    }
  ],
  "10_emergency_response": [
    {
      "label": "Emergency Facility Siting and Prepositioning",
      "ids": [
        "P0018", "P0464"
      ]
    },
    {
      "label": "Disaster Response and Evacuation",
      "ids": [
        "P0009", "P0310", "P0322"
      ]
    }
  ],
  "11_information_quantum_technology": [
    {
      "label": "Quantum Circuit Layout and Control",
      "ids": [
        "P0049", "P0056"
      ]
    },
    {
      "label": "Cloud Capacity Planning",
      "ids": [
        "P0058"
      ]
    },
    {
      "label": "Classification Rule Learning",
      "ids": [
        "P0099"
      ]
    }
  ],
  "12_general_optimization_network_modeling": [
    {
      "label": "Resource Planning and Scenario Fitting",
      "ids": [
        "P0044", "P0060", "P0082", "P0197", "P0427", "P0432", "P0453"
      ]
    },
    {
      "label": "Graph Partitioning and Connectivity",
      "ids": [
        "P0198", "P0435"
      ]
    },
    {
      "label": "Online Matching, Admission and Queues",
      "ids": [
        "P0059", "P0458", "P0467", "P0468"
      ]
    }
  ]
};
