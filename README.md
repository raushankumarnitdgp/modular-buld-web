# modular-buld-web


1. to use file dependency-manager.js ,create a object of DependencyManager<br>
   
   app = new DependencyManager(treeData) where treeData = {stats.json}<br>
   
   a. app.getPublicModules() //to list all public modules<br>
   b. app.selectModule(name) //select a module by name<br>
       example: app.selectModule('./develop/src/mantle/renderer-javascript/charts/fusioncharts.basechart.js')<br>
   c. app.deselectModule(name) //to deselect a module by name<br>
   d. app.getSize() //to get current total size of selected modules<br>
   e. app.getModules() //list of currently selected public modules<br>
   
2. to use file getSizeof-Module-Dependency.js , create a object of GetSizeByName<br>

    sizeObj = new GetSizeByName(treeData) where treeData = {stats.json}<br>
    
    a. sizeObj.getSizeByName(name ,alreadySelected) //get the size, that will be added if module.name = name ,<br>when there is list of alreadySelected public modules where name is module name and alreadySelected is array of module names<br>
       example: <br>
       name = './develop/src/mantle/renderer-javascript/charts/fusioncharts.mscartesian.js';<br>
       alreadySelected=['./develop/src/mantle/renderer-javascript/charts/fusioncharts.basechart.js'];<br>
       sizeObj.getSizeByName(name ,alreadySelected);
       
    
      
