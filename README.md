# modular-buld-web
to use file dependency-manager.js

1. create a object of DependencyManager
   
   app = new DependencyManager(treeData) where treeData = {stats.json}
   
   a. app.getPublicModules() //to list all public modules
   b. app.selectModule(name) //select a module by name
   c. app.deselectModule(name) //to deselect a module by name
   d. app.getSize() //to get current total size of selected modules
   e. app.getModules() //list of current public modules
   
2. to use file getSizeof-Module-Dependency.js , create a object of GetSizeByName

    sizeObj = new GetSizeByName(treeData) where treeData = {stats.json}
    
    a. sizeObj.getSizeByName(name ,alreadySelected) //get the size, that will be added if module.name = name ,when there is list of alreadySelected public modules 
where name is module name and alreadySelected is array of module names
