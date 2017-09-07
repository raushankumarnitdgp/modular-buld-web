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
    let node = getNode(name);
    // intial the visitedCount count of node
    node.visitedCount = (node.visitedCount || 0);
    // if visitedCount is 0 then add its size 
    if (node.visitedCount === 0) {
      totalSize += (node.size || 0);
      // increment the count
      node.visitedCount = node.visitedCount + 1;
      if (isPublic(node.name)) {
        _includePublicDep(name);
      }
      return true;
    } else {
      // increment the count
      node.visitedCount = node.visitedCount + 1;
      // ** Special case **//
      // If the node is already included but it is a public one, then we might need to disable it
      if (isPublic(node.name)) {
        _includePublicDep(name);
      }
      // Already included, so don't need to iterate through children
      return false;
    }
  },
  /**
   * This method got called when any node got selected
   * @param  {String} name the name of the node that got selected
   */
  nodeSelect = function (name) {
    let node = getNode(name);
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
    // if for the first time it is getting included
    if (node.visitedCount === 0) {
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
      if (isPublic(node.name) && node.isUserSelected && (node.visitedCount === 1)) {
        // call this for public nodes that are direct inclusion, should be enabled now
        checkbox.disabled = false;
      }
      // this node is not excluded, so don't need to iterate through children
      return false;
    }
  },
  /**
   * This method got called when any node got de-selected
   * @param  {String} name the name of the node that got selected
   */
  nodeDeSelect = function (name) {
    let node = getNode(name);
    if (node) {
      node.visitedCount = 0;
      node.isUserSelected = false;
      totalSize -= (node.size || 0);
      // iterate the de-selector among all children
      iterateDep(name, _deSelectIterator);
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
        dontToggle = nodeDeSelect(name);
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
        if (reasons) {
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
    document.getElementById('size').innerHTML = '<br>Total size of selected Files: ' + totalSize + ' bytes';
  },
  /**
   * This methode handles all generated errors
   * @param  {Stirng} msg the error message
   */
  logError = function (msg) {
    console.error && console.error(msg);
  };

// Load the data
loadOptions(treeData);