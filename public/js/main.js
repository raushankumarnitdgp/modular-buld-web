function findDependencySize(treeData) {
  let getNode,
    totalSize = 0,
    includeFile = {},
    /**
     * This function extract the file name from a string and return that
     * @param {String} str the path string
     * @return {String} the file name
     */
    getName = function (str) {
      return str.substring(str.lastIndexOf('/') + 1);
    },
    /**
     * This method decides whether a module is public or not
     * @param {String} str the path string
     * @return {Boolean} whether this is apublic module or not
     */
    isPublic = function (modulePath) {
      return !!modulePath.match(/mantle\/renderer-javascript\/charts\//ig);
    },
    isPublic1 = function (modulePath) {
      return !!modulePath.match(/M/ig);
    },
    iterateDep,
    /**
     * This method got traversed on all public dependencies nodes, then mark it selected and make it disbled
     * @param  {String} name the dependency node's name that needs to be worked on
     */
    _includePublicDep = function (name) {
      let node = getNode(name),
        checkbox = document.querySelector("input[name='" + name + "']");
      // make it checked
      checkbox.checked = true;

      // make it disabled, if it is a dependency for another module 
      if (node.visitedCount) {
        checkbox.disabled = true;
      }
    },
    /**
     * This method got traversed on all dependencies node
     * @param  {String} name the dependency node's name that needs to be worked on
     */
    _selectIterator = function (name) {
      let node = getNode(name),
        isTraverseFurther = false;
      // intial the visitedCount count of node
      node.visitedCount = (node.visitedCount || 0);
      // if visitedCount is 0 then add its size 
      if (node.visitedCount === 0) {
        totalSize += (node.size || 0);
        // increment the count
        node.visitedCount = node.visitedCount + 1;
        // console.log(name +" visited count: "+node.visitedCount);
        if (isPublic(node.name)) {
          _includePublicDep(name);
        }
        isTraverseFurther = true;
      } else {
        // increment the count
        node.visitedCount = node.visitedCount + 1;
        // console.log(name +" visited count: "+node.visitedCount);
        // ** Special case **//
        // If the node is already included but it is a public one, then we might need to disable it
        if (isPublic(node.name)) {
          _includePublicDep(name);
        }
        // Already included, so don't need to iterate through children
        isTraverseFurther = false;
      }

      //console.log(name + " visited count: " + node.visitedCount);
      return isTraverseFurther;
    },
    /**
     * This method got called when any node got selected
     * @param  {String} name the name of the node that got selected
     */
    nodeSelect = function (name) {
      let node = getNode(name);
      //console.log('\n\n')
      if (node) {
        node.visitedCount = 1;
        node.isUserSelected = true;
        totalSize += (node.size || 0);
        iterateDep(name, _selectIterator);
        return true;
      }
    },
    /**
     * This method got traversed on all dependencies node
     * @param  {String} name the dependency node's name that needs to be worked on
     */
    _deSelectIterator = function (name) {
      let node = getNode(name),
        checkbox = document.querySelector("input[name='" + name + "']");
      // decrease the selectedDep count
      node.visitedCount = (node.visitedCount || 1) - 1;
      //console.log(name + " visited count: " + node.visitedCount);
      // if for the first time it is getting included
      if (isPublic(node.name) && node.visitedCount === 0 && node.isUserSelected && !checkbox.disabled) {
        totalSize -= (node.size || 0);
        if (isPublic(node.name)) {
          // public nodes should be reset now
          // remove the disablity
          checkbox.disabled = false;
          // make it un-checked
          checkbox.checked = false;
        }
        return true;
      } else
      if (!isPublic(node.name) && node.visitedCount === 0) {
        // do the first inclusion procedure
        totalSize -= (node.size || 0);
        if (isPublic(node.name)) {
          // public nodes should be reset now
          // remove the disablity
          checkbox.disabled = false;
          // make it un-checked
          checkbox.checked = false;
        }
        return true;
      } else {
        if (isPublic(node.name) && node.isUserSelected && (node.visitedCount === 0 || node.visitedCount === 1)) {
          // call this for public nodes that are direct inclusion, should be enabled now
          checkbox.disabled = false;
        } else if (isPublic(node.name) && (node.visitedCount === 0 || node.visitedCount === 1)) {
          // remove the disablity
          checkbox.disabled = false;
          // make it un-checked
          checkbox.checked = false;
        }
        // this node is not excluded, so don't need to iterate through children
        return false;
      }
    },
    /**
     * This method got called when any node got de-selected
     * @param  {String} name the name of the node that got selected
     */
    nodeDeSelect = function (name, treeJSON) {
      let node = getNode(name),
        checkbox;
      if (node) {
        node.visitedCount = 0;
        node.isUserSelected = false;
        totalSize -= (node.size || 0);
        // iterate the de-selector among all children
        iterateDep(name, _deSelectIterator);
        totalSize = 0;

        //iterate through all modules make visitedCount 0
        for (key in treeJSON.modules) {
          if (treeJSON.modules.hasOwnProperty(key)) {
            treeJSON.modules[key].visitedCount = 0;
          }
        }
        //iterate through all checkbox of public modules
        for (key in treeJSON.modules) {
          if (treeJSON.modules.hasOwnProperty(key)) {
            node = treeJSON.modules[key];
            if (isPublic(node.name)) {
              checkbox = document.querySelector("input[name='" + node.name + "']");
              if ((checkbox.checked === true) && (checkbox.disabled === true)) {
                checkbox.disabled = false;
                if (!node.isUserSelected) checkbox.checked = false;
              }
            }
          }
        }
        //iterate through all checkbox of public modules
        for (key in treeJSON.modules) {
          if (treeJSON.modules.hasOwnProperty(key)) {
            node = treeJSON.modules[key];
            if (isPublic(node.name)) {
              checkbox = document.querySelector("input[name='" + node.name + "']");
              if ((checkbox.checked === true) && (checkbox.disabled === false)) {
                nodeSelect(node.name);
              }
            }
          }
        }
      }
    },
    toggleSelect = function (e) {
      let node = this,
        checkStatus = node.checked,
        name = node.getAttribute('name'),
        dontToggle;
      if (name) {
        if (checkStatus) {
          dontToggle = nodeSelect(name);
        } else {
          dontToggle = nodeDeSelect(name, treeData);
        }
        // if (!dontToggle) {
        //   node.checked = !checkStatus;
        // }
      }
      printSizeSelected();
      //console.log(includeFile);
    },

    /**
     * Create the DOM elements corrosponding each node
     * @param  {String} name the name of the node
     */
    formatter = function (name) {
      // create the root element
      let node = getNode(name),
        child = document.createElement('div');
      child.setAttribute('name', name);

      // // create the checkbox
      let checkBox = document.createElement('input');
      checkBox.setAttribute('type', 'checkbox');
      checkBox.setAttribute('name', name);
      checkBox.addEventListener('click', toggleSelect);
      child.appendChild(checkBox);

      // // create the Name
      let nameElem = document.createElement('span');
      nameElem.innerHTML = getName(node["name"]) + " :- ";
      nameElem.setAttribute('name', nameElem);
      child.appendChild(nameElem);

      // // create the description
      let desc = document.createElement('span');
      desc.innerHTML = node["name"];
      desc.setAttribute('name', name);
      child.appendChild(desc);

      return child;
    },
    /**
     * Create the visuals for the individual nodes
     * @param  {String} name the name of teh node that needs to be displayed 
     */
    displayNode = function (name) {
      let a = formatter(name);
      document.getElementById('main').appendChild(a);
    },
    /**
     * This method parse the global data and create the visual options
     * @param  {Object} treeJSON the global tree info data
     */
    loadOptions = function (treeJSON) {
      let i, key, node;

      // define the get node method which will be used by others
      getNode = function (name) {
        let modules = treeJSON.modules,
          i = 0,
          l = modules.length;
        for (i = 0; i < l; i += 1) {
          if (modules[i].name === name) {
            return modules[i];
          }
        }
      };

      /**
       * This method traverse through all dependencies node
       * @param  {String} name the name of node object, dependencies of which will be iterated
       * @param  {Function} mapFn function that will be called for each dependencies
       *                          If the function returns flase, then the dependencies of this node will not be traversed
       */
      iterateDep = function (name, mapFn) {
        let modules = treeJSON.modules,
          i = 0,
          l = modules.length,
          mod,
          modName,
          reasons,
          ri, rl, modInName = {};
        for (i = 0; i < l; i += 1) {
          mod = modules[i];
          modName = mod.name;
          reasons = mod.reasons;
          //added
          if (reasons && (modName != name)) {
            ri = 0;
            rl = reasons.length;
            for (ri = 0; ri < rl; ri += 1) {
              if (reasons[ri].moduleName === name) {
                //added
                modInName[modName] = modules[i];
                traverseDeep = mapFn(modName);
                //change here
                if (traverseDeep === true) {
                  iterateDep(modName, mapFn);
                }
              }
            }
          }
        }
        if (Object.keys(modInName).length)
          includeFile[name] = modInName;
      }

      for (key in treeJSON.modules) {
        if (treeJSON.modules.hasOwnProperty(key)) {
          node = treeJSON.modules[key];
          if (isPublic(node.name)) {
            displayNode(node.name);
          }
        }
      }
      printSizeSelected();
    },
    /**
     * This methode prints totalsize of selected files on html page
     */
    printSizeSelected = function () {
      //intitally total size is 0
      var kb = (totalSize / 1024).toPrecision(4),
        mb;
      mb = (kb / 1024).toPrecision(4);
      if (mb > 1)
        document.getElementById('size').innerHTML = '<br>Total size of selected Files: ' + mb + ' MB';
      else if (kb > 1)
        document.getElementById('size').innerHTML = '<br>Total size of selected Files: ' + kb + ' KB';
      else
        document.getElementById('size').innerHTML = '<br>Total size of selected Files: ' + totalSize + ' bytes';
    },
    isCyclicGraph = function (startName, currentModule, path) {
      let i, reasons = currentModule.reasons,
          iterModule;
      currentModule.visited = true;
      for (i = 0; i < reasons.length; i++) {
          if (reasons[i].moduleName === startName) {
              return true;
          }
          if (reasons[i].moduleName) {
              iterModule = getNode(reasons[i].moduleName);
              if (iterModule && !iterModule.visited) {
                  if (isCyclicGraph(startName, iterModule, path)) {
                      path[path.length] = iterModule.name;
                      return true;
                  }
              }
          }
      }
      return false;
  }

  printCyclic = function(treeJSON) {
      let modules = treeJSON.modules,
          i, j, startModule, path = [];

      for (j = 0; j < modules.length; j++) {
          modules[j].visited = false;
      }

      for (i = 0; i < modules.length; i++) {
          startModule = modules[i];
          path = [];
          path[0] = startModule.name;
          if (isCyclicGraph(startModule.name, startModule, path)) {
              console.log("Cyclic at: " + startModule.name);
              path[path.length] = startModule.name;
              console.log("Cyclic Path : " + path);
          }
          for (j = 0; j < modules.length; j++) {
              modules[j].visited = false;
          }
      }
  }
    /**
     * This methode handles all generated errors
     * @param  {Stirng} msg the error message
     */
    logError = function (msg) {
      console.error && console.error(msg);
    };

  // Load the data
  loadOptions(treeData);
};
//printCyclic(treeData);
//entry Point
findDependencySize(treeData);