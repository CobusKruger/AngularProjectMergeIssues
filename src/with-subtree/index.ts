import { Rule, SchematicContext, Tree, chain, externalSchematic, applyToSubtree } from '@angular-devkit/schematics';

export function createProject(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([
      externalSchematic('@schematics/angular', 'ng-new', {
        name: 'NewAngularApp',
        prefix: 'naa',
        directory: 'NewAngularAppWithSubtree',
        skipInstall: true,
        skipGit: true,
        skipTests: true,
        routing: false,
        style: 'scss',
        version: '^8.2.0'
      }),
      applyToSubtree('NewAngularAppWithSubtree', [
        externalSchematic('@schematics/angular', 'library', {
          name: 'NewLib',
          prefix: 'nal',
          skipInstall: true,
          lintFix: false
        })
      ])
    ]);
  };
}
