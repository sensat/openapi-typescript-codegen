import type { Model } from '../client/interfaces/Model';
import { postProcessModelName } from './postProcessModelName';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
export const postProcessModelImports = (model: Model, pkg: string, fullyQualifiedNames: boolean): string[] => {
    return model.imports
        .filter(unique)
        .sort(sort)
        .filter(name => model.name !== name)
        .map(name => postProcessModelName(name, pkg, fullyQualifiedNames));
};
