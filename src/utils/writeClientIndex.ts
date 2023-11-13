import { dirname, resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { mkdir, writeFile } from './fileSystem';
import { getModulePath } from './getModulePath';
import { Templates } from './registerHandlebarTemplates';
import { sortModelsByName } from './sortModelsByName';
import { sortServicesByName } from './sortServicesByName';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param clientName Custom client class name
 */
export const writeClientIndex = async (
    client: Client,
    name: string,
    templates: Templates,
    outputPath: string,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    exportClient: boolean,
    postfixServices: string,
    postfixModels: string,
    clientName?: string
): Promise<void> => {
    const file = resolve(outputPath, `${getModulePath(name)}.ts`);
    await mkdir(dirname(file));

    const templateResult = templates.index({
        name,
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        exportClient,
        useUnionTypes,
        postfixServices,
        postfixModels,
        clientName,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        schemas: sortModelsByName(client.schemas),
    });

    await writeFile(file, templateResult);
};
