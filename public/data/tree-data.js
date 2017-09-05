var treeData = {
  "nodes": {
    "node1": {
      "display-name": "Core Module",
      "desc": "This is the core module",
      "public": true,
      "directInclusion": false, // defines that the node is directly choosen by user
      "source": 500, // Surce in byte
      "included": false, // Defines whether this node is included for the current build
      "selectionDep": 0, // defines the dependencies count as per curent selection
      "dep": {
        "node5": {},
      }
    },
    "node2": {
      "display-name": "Chart 1",
      "desc": "This is the module for chart 1",
      "public": true,
      "source": 100,
      "dep": {
        "node1": {},
        "node4": {}
      }
    },
    "node3": {
      "display-name": "Chart 2",
      "desc": "This is the module for chart 1",
      "public": true,
      "source": 150,
      "dep": {
        "node1": {},
        "node5": {},
        "node6": {}
      }
    },
    "node4": {
      "display-name": "internal",
      "desc": "This is the module for chart 1",
      "public": false,
      "source": 50,
      "dep": {
        "node5": {},
        "node6": {}
      }
    },
    "node5": {
      "display-name": "internal2",
      "desc": "This is the internal module",
      "public": false,
      "source": 200,
      "dep": {
        "node6": {}
      }
    },
    "node6": {
      "display-name": "internal2",
      "desc": "This is the internal module",
      "public": false,
      "source": 10
    }
  },
  "rootNode": "node1",
  "sourceToMinRation": 0.21
}