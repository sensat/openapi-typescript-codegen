import type { Client } from '../client/interfaces/Client';
import { postProcessModel } from './postProcessModel';
import { postProcessSchema } from './postProcessSchema';
import { postProcessService } from './postProcessService';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
export const postProcessClient = (
    client: Client,
    servicePkg: string,
    servicePostfix: string,
    modelPkg: string,
    schemaPkg: string,
    fullyQualifiedNames: boolean
): Client => {
    return {
        ...client,
        models: client.models.map(model => postProcessModel(model, modelPkg, fullyQualifiedNames)),
        services: client.services.map(service =>
            postProcessService(service, servicePkg, servicePostfix, modelPkg, fullyQualifiedNames)
        ),
        schemas: client.schemas.map(schema => postProcessSchema(schema, schemaPkg, fullyQualifiedNames)),
    };
};
