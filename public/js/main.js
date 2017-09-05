let getNode,
totalSize = 0,
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
// /**
//  * This method traverse through all dependencies node
//  * @param  {String} name the name of node object, dependencies of which will be iterated
//  * @param  {Function} mapFn function that will be called for each dependencies
//  *                          If the function returns flase, then the dependencies of this node will not be traversed
//  */
// iterateDep = function (name, mapFn) {
//   let node = getNode(name);
//   if (node && node.dep) {
//     let dep = node.dep,
//     key,
//     traverseDeep;
//     for (key in dep) {
//       if (dep.hasOwnProperty(key)) {
//         if (getNode(key)) {
//           traverseDeep = mapFn(key);
//           if (traverseDeep != false) {
//             iterateDep(key, mapFn);
//           }
//         }
//       }
//     }
//   }
// },
/**
 * This method got traversed on all public dependencies nodes, then mark it selected and make it disbled
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_includePublicDep = function (name) {
  let node = getNode(name),
  checkbox = document.querySelector("input[name='" + name + "']");
  // make it checked
  checkbox.checked = true;

  // make it disabled, if it is a dependency for anothe rmodule
  if (node.selectionDep) {
    checkbox.disabled = true;
  }

  console.log(name);
},

/**
 * This method got traversed on all internal dependencies nodes, then mark it included
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_includeDep = function (name) {
  let node = getNode(name);
  totalSize += (node.size || 0);
  // mark the code as included
  node.included = true;

  if (isPublic(node.name)) {
    _includePublicDep(name);
  } else {
    console.log('non-public:- ' + name);
  }
},
/**
 * This method got traversed on all dependencies node
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_selectIterator = function (name) {
  let node = getNode(name);
  // increase the selectedDep count
  node.selectionDep = (node.selectionDep || 0) + 1;

  // if for the first time it is getting included
  if (!node.included) {
    // do the first inclusion procedure
    _includeDep(name)
  } else {
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
  if (node && !node.included) {
    node.directInclusion = true;
    _includeDep(name);
    iterateDep(name, _selectIterator);
    return true;
  }
},
/**
 * This method got traversed on all public dependencies nodes, then mark it de-selected
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_excludePublicDep = function (name) {
  let node = getNode(name),
  checkbox = document.querySelector("input[name='" + name + "']");
  if (checkbox) {
    // remove the disablity
    checkbox.disabled = false;
    // if the node is seperately selected
    if (!node.directInclusion) {
      // make it un-checked
      checkbox.checked = false;
    }
  }
  console.log(name);
},
/**
 * This method got traversed on all dependency nodes, then mark it excluded (included = false)
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_excludeDep = function (name) {
  let node = getNode(name);
  totalSize -= (node.size || 0);
  // mark the code as included
  node.included = false;

  if (isPublic(node.name)) {
    _excludePublicDep(name);
  }

  console.log('non-public exclude:- ' + name);
},

/**
 * This method got traversed on all dependencies node
 * @param  {String} name the dependency node's name that needs to be worked on
 */
_deSelectIterator = function (name) {
  let node = getNode(name);
  // increase the selectedDep count
  node.selectionDep = (node.selectionDep || 1) - 1;
  // if for the first time it is getting included
  if (!node.selectionDep && !node.directInclusion) {
    // do the first inclusion procedure
    _excludeDep(name);
  } else {
    if (isPublic(node.name)){
      // call this for public nodes that are direct inclusion, should be enabled now
      _excludePublicDep(name);
    }
    // Already included, so don't need to iterate through children
    return false;
  }

},
/**
 * This method got called when any node got de-selected
 * @param  {String} name the name of the node that got selected
 */
nodeDeSelect = function (name) {
  let node = treeData.nodes && treeData.nodes[name];
  if (node && !node.selectionDep) {
    node.directInclusion = false;
    _excludeDep(name);
    // iterate the de-selector among all children
    iterateDep(name, _deSelectIterator);
  }
},
toggleSelect = function (e) {
  let node  = this,
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
      ri, rl;
    for (i = 0; i < l; i += 1) {
      mod = modules[i];
      modName = mod.name;
      reasons = mod.reasons;
      if (reasons) {
        ri = 0; rl = reasons.length;
        for (ri = 0; ri < rl; ri += 1) {
          if (reasons[ri].moduleName === name) {
            traverseDeep = mapFn(modName);
            if (traverseDeep != false) {
              iterateDep(key, mapFn);
            }
          }
        }
      }
    }


    let node = getNode(name);
    if (node && node.dep) {
      let dep = node.dep,
      key,
      traverseDeep;
      for (key in dep) {
        if (dep.hasOwnProperty(key)) {
          if (getNode(key)) {
            traverseDeep = mapFn(key);
            if (traverseDeep != false) {
              iterateDep(key, mapFn);
            }
          }
        }
      }
    }
  }

  for (key in treeJSON.modules) {
    if (treeJSON.modules.hasOwnProperty(key)) {
      node = treeJSON.modules[key];
      if (isPublic(node.name)) {
        displayNode(node.name);
      }
    }
  }
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