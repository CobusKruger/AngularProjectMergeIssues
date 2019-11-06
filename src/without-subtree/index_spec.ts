import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';


const collectionPath = path.join(__dirname, '../collection.json');

describe('without-subtree', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('without-subtree', {}, Tree.empty()).toPromise();
    expect(tree.files).toEqual([]);
  });
});
