import type { Service } from '../client/interfaces/Service';
import { postProcessServiceImports } from './postProcessServiceImports';
import { postProcessServiceName } from './postProcessServiceName';
import { postProcessServiceOperations } from './postProcessServiceOperations';

export const postProcessService = (
    service: Service,
    servicePkg: string,
    servicePostfix: string,
    modelPkg: string,
    fullyQualifiedNames: boolean
): Service => {
    const clone = { ...service };

    clone.name = postProcessServiceName(clone.name, servicePkg, servicePostfix, fullyQualifiedNames);

    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone, modelPkg, fullyQualifiedNames);
    return clone;
};
