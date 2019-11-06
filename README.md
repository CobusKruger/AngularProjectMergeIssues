# Overview

This project demonstrates how the Angular schematic for creating libraries don't play well with the one creating application workspaces.

# Problem Description

An Angular library is always part of an application workspace. This `collection.json` attempts to combine these two actions:
1. Create a new Angular application using a call to `externalSchematic('@schematics/angular', 'ng-new')`.
2. Create a new library within that application using a call to `externalSchematic('@schematics/angular', 'library')`.

The first attempt (illustrated in the schematic `without-subtree`) simply chains the two rules. However, this fails because the `library` schematic cannot see the application's `angular.json` file. The full error message is this:

```
An error occured:
Error: Unable to locate a workspace file for workspace path.
    at Object.readWorkspace (C:\dev\scratchpad\scaffolding-tests\node_modules\@angular-devkit\core\src\workspace\core.js:74:19)
    at async Object.getWorkspace (C:\dev\scratchpad\scaffolding-tests\node_modules\@schematics\angular\utility\workspace.js:51:27)
    at async C:\dev\scratchpad\scaffolding-tests\node_modules\@schematics\angular\library\index.js:153:27
```

This makes sense, because the library cannot live on its own. Unlike [module](https://github.com/angular/angular-cli/blob/85b671147ed67d7aa6ceb4b8fe4d26b73fff75ba/packages/schematics/angular/module/schema.json), [component](https://github.com/angular/angular-cli/blob/85b671147ed67d7aa6ceb4b8fe4d26b73fff75ba/packages/schematics/angular/component/schema.json) and [service](https://github.com/angular/angular-cli/blob/85b671147ed67d7aa6ceb4b8fe4d26b73fff75ba/packages/schematics/angular/service/schema.json), the [library schema](https://github.com/angular/angular-cli/blob/85b671147ed67d7aa6ceb4b8fe4d26b73fff75ba/packages/schematics/angular/library/schema.json) does not take a path as input. So if you cannot specify the path of the library, you effectively cannot call this schematic from one that also creates the application.

The second attempt (illustrated in the schematic `with-subtree`) attempts to remedy the problem with the (as far as I can tell) entirely undocumented API function `applyToSubtree`. This appears to be a reasonable alternative, because it limits the accessible tree to the path specified. Tests with simpler schematics show this working just fine, even though the unexplained restriction to always return the original tree can cause issues.

Nevertheless, it appears to be the correct way to scope the external schematic and I think it probably works, as the schematic now finds the workspace file.

Unfortunately, now the `library` schematic fails with another error:

```
An error occured:
Error: A merge conflicted on path "/NewAngularAppWithSubtree/projects/new-lib/src/lib/new-lib.module.ts".
    at C:\Users\cobusk\AppData\Roaming\npm\node_modules\@angular-devkit\schematics-cli\node_modules\@angular-devkit\schematics\src\tree\host-tree.js:132:35
    at Array.forEach (<anonymous>)
    at HostTree.merge (C:\Users\cobusk\AppData\Roaming\npm\node_modules\@angular-devkit\schematics-cli\node_modules\@angular-devkit\schematics\src\tree\host-tree.js:121:23)
    at ScopedTree.merge (C:\dev\scratchpad\scaffolding-tests\AngularProjectMergeIssues\node_modules\@angular-devkit\schematics\src\tree\scoped.js:72:20)
    at MapSubscriber.project (C:\dev\scratchpad\scaffolding-tests\node_modules\@angular-devkit\schematics\src\rules\schematic.js:42:19)
    at MapSubscriber._next (C:\dev\scratchpad\scaffolding-tests\node_modules\rxjs\internal\operators\map.js:49:35)
    at MapSubscriber.Subscriber.next (C:\dev\scratchpad\scaffolding-tests\node_modules\rxjs\internal\Subscriber.js:66:18)
    at TapSubscriber._next (C:\dev\scratchpad\scaffolding-tests\node_modules\rxjs\internal\operators\tap.js:65:26)
    at TapSubscriber.Subscriber.next (C:\dev\scratchpad\scaffolding-tests\node_modules\rxjs\internal\Subscriber.js:66:18)
    at TakeLastSubscriber._complete (C:\dev\scratchpad\scaffolding-tests\node_modules\rxjs\internal\operators\takeLast.js:71:29)
```

There are a couple of problems with this merge failure:
1. The file with the merge conflict is a new file created by the `library` schematic. So since it didn't exist before, it appears the `library` schematic is conflicting with itself.
2. There is no way to specify the `MergeStrategy` to use, as it happens within the `library` schematic.

# How To Use This Project

There are two schematics in `collection.json`. To test them, you can run the scripts in `package.json`.