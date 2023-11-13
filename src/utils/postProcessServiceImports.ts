import type { Service } from '../client/interfaces/Service';
import { postProcessModelName } from './postProcessModelName';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Set unique imports, sorted by name
 * @param service
 */
export const postProcessServiceImports = (
    service: Service,
    modelPkg: string,
    fullyQualifiedNames: boolean
): string[] => {
    return service.imports
        .filter(unique)
        .sort(sort)
        .map(name => postProcessModelName(name, modelPkg, fullyQualifiedNames));
};
