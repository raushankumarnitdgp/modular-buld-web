var treeData = {
    "modules":[
        {
            "name": "M1",
            "size": 10,
            "reasons":[
                {
                    "module": "M2",
                    "moduleName": "M2"
                }
            ]
        },
        {
            "name": "M2",
            "size": 20,
            "reasons":[
                {
                }
            ]
        },
        {
            "name": "M3",
            "size": 30,
            "reasons":[
                {
                    "module": "M1",
                    "moduleName": "M1"
                }
            ]
        },
        {
            "name": "a",
            "size": 40,
            "reasons":[
                {
                    "module": "M1",
                    "moduleName": "M1"
                }
            ]
        },
        {
            "name": "b",
            "size": 60,
            "reasons":[
                {
                    "module": "M1",
                    "moduleName": "M1"
                },
                {
                    "module": "M2",
                    "moduleName": "M2"
                },
                {
                    "module": "c",
                    "moduleName": "c"
                }
            ]
        },
        {
            "name": "c",
            "size": 40,
            "reasons":[
                {
                    "module": "b",
                    "moduleName": "b"
                }
            ]
        },
        {
            "name": "d",
            "size": 70,
            "reasons":[
                {
                    "module": "M2",
                    "moduleName": "M2"
                },
                {
                    "module": "M3",
                    "moduleName": "M3"
                }
            ]
        },
        {
            "name": "e",
            "size": 50,
            "reasons":[
                {
                    "module": "M3",
                    "moduleName": "M3"
                }
            ]
        }
    ]
};