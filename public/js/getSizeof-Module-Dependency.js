var individualTreeData = require('../../stats');
var exec = require('exec');
class GetSizeByName {
    constructor(treeJSON) {
        this.treeData = treeJSON;
        this.moduleData = treeJSON.modules;
        this.totalSize = 0;
    }
    isPublic(modulePath) {
        return !!modulePath.match(/mantle\/renderer-javascript\/charts\//ig);
    }
    getNode(name) {
        let modules = this.moduleData,
            i = 0,
            l = modules.length;
        for (i = 0; i < l; i += 1) {
            if (modules[i].name === name) {
                return modules[i];
            }
        }
    }
    _includePublicDep(name) {
        let node = this.getNode(name);
        // make it checked
        node.checked = true;

        // make it disabled, if it is a dependency for another module 
        if (node.visitedCount) {
            node.disabled = true;
        }
    }
    _selectIterator(name) {
        let node, isTraverseFurther = false;
        node = this.getNode(name);
        // intial the visitedCount count of node
        node.visitedCount = (node.visitedCount || 0);
        // if visitedCount is 0 then add its size 
        if (!node.visitedCount) {
            this.totalSize += (node.size || 0);
            // increment the count
            node.visitedCount = node.visitedCount + 1;
            // console.log(name +" visited count: "+node.visitedCount);
            if (this.isPublic(node.name)) {
                this._includePublicDep(name);
            }
            isTraverseFurther = true;
        } else {
            // increment the count
            node.visitedCount = node.visitedCount + 1;
            // console.log(name +" visited count: "+node.visitedCount);
            // ** Special case **//
            // If the node is already included but it is a public one, then we might need to disable it
            if (this.isPublic(node.name)) {
                this._includePublicDep(name);
            }
            // Already included, so don't need to iterate through children
            isTraverseFurther = false;
        }

        //console.log(name + " visited count: " + node.visitedCount);
        return isTraverseFurther;
    }
    iterateDep(name, dependentOnObj) {
        let modules = this.moduleData,
            i = 0,
            l = modules.length,
            mod,
            modName,
            reasons,
            ri, rl, modInName = {},
            traverseDeep;

        for (i = 0; i < l; i += 1) {
            mod = modules[i];
            modName = mod.name;
            reasons = mod.reasons;
            //added
            if (reasons && (modName !== name)) {
                ri = 0;
                rl = reasons.length;
                for (ri = 0; ri < rl; ri += 1) {
                    if (reasons[ri].moduleName === name) {
                        //added
                        modInName[modName] = modules[i];
                        if (arguments.length > 1 && this.isPublic(modName)) {
                            var depObj = {};
                            depObj[mod.name] = {
                                "name": mod.name,
                                "parent": name,
                                "children": []
                            };
                            dependentOnObj[name].children.push(depObj);
                        }
                        traverseDeep = this._selectIterator(modName);
                        //change here
                        if (traverseDeep) {
                            if (arguments.length > 1 && this.isPublic(modName)) {
                                var len = dependentOnObj[name].children.length;
                                this.iterateDep(modName, dependentOnObj[name].children[len - 1]);
                            } else {
                                this.iterateDep(modName);
                            }
                        }
                    }
                }
            }
        }
    }
    nodeSelect(name, dependentOnObj) {
        let node = this.getNode(name);
        if (node) {
            node.visitedCount = 1;
            node.isUserSelected = true;
            node.checked = true;
            node.disabled = false;
            this.totalSize += (node.size || 0);
            if (arguments.length > 1) {
                dependentOnObj[name] = {
                    "name": name,
                    "parent": "null",
                    "children": []
                };
                this.iterateDep(name, dependentOnObj);
            } else {
                this.iterateDep(name);
            }
            return true;
        }
    }
    //get current total size 
    getSize() {
        var kb = (this.totalSize / 1024).toPrecision(4),
            mb;
        mb = (kb / 1024).toPrecision(4);
        if (mb > 1)
            return mb.toString() + ' MB';
        else if (kb > 1)
            return kb.toString() + ' KB';
        else
            return this.totalSize + ' bytes';
    }
    //get the size, that will be added if module.name = name ,when there is list of alreadySelected public modules 
    getSizeByName(name, alreadySelected) {
        let i = 0,
            key, modules = this.moduleData;
        for (key in modules) {
            modules[key].disabled = false;
            modules[key].checked = false;
            modules[key].visitedCount = 0;
        }
        for (i = 0; i < alreadySelected.length; i++) {
            this.nodeSelect(alreadySelected[i]);
        }
        this.totalSize = 0;
        this.nodeSelect(name);
        return this.getSize();
    }

    //path of dependencies of given module
    dependenciesPathOfModule(name) {
        let modules = this.moduleData,
            key, dependentOnObj = {};
        for (key in modules) {
            modules[key].disabled = false;
            modules[key].checked = false;
            modules[key].visitedCount = 0;
        }
        // to get getPathOfDependent
        this.nodeSelect(name, dependentOnObj);
        dependentOnObj = JSON.stringify(dependentOnObj);
        //console.log(dependentOnObj);
        // dependentOnObj = dependentOnObj.replace(/"\d+":/ig, "");
        dependentOnObj = dependentOnObj.replace(/"[a-z0-9.\/-]+"\s*:\s*{/ig, "{");
        dependentOnObj = dependentOnObj.replace(/{\s*{/ig, "{");
        dependentOnObj = dependentOnObj.replace(/}\s*}/ig, "}");
        dependentOnObj = dependentOnObj.replace(/"/ig, '\\"');
        dependentOnObj = "var treeData = [" + dependentOnObj +"]";
        exec(`echo ${dependentOnObj} > treeData1.js`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        return dependentOnObj;
    }
};

var app = new GetSizeByName(individualTreeData);

app.dependenciesPathOfModule('./develop/src/mantle/renderer-javascript/charts/fusioncharts.pie3d.js');