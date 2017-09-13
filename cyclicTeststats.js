var treeData = {
    "modules": [{
            "name": "A",
            "size": 10,
            "reasons": [{
                    "module": "E",
                    "moduleName": "E"
                },
                {
                    "module": "D",
                    "moduleName": "D"
                }
            ]
        },
        {
            "name": "B",
            "size": "10",
            "reasons": [{
                "module": "A",
                "moduleName": "A"
            }]
        },
        {
            "name": "C",
            "size": "10",
            "reasons": [{
                "module": "B",
                "moduleName": "B"
            }]
        },
        {
            "name": "D",
            "size": "10",
            "reasons": [{
                "module": "C",
                "moduleName": "C"
            }]
        },
        {
            "name": "E",
            "size": "10",
            "reasons": [{}]
        },
        {
            "name": "F",
            "size": "10",
            "reasons": [{
                    "module": "E",
                    "moduleName": "E"
                },
                {
                    "module": "H",
                    "moduleName": "H"
                }
            ]
        },
        {
            "name": "G",
            "size": "10",
            "reasons": [{
                "module": "F",
                "moduleName": "F"
            }]
        },
        {
            "name": "H",
            "size": "10",
            "reasons": [{
                "module": "G",
                "moduleName": "G"
            }]
        }
    ]
}