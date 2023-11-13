import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import { isDefined } from './isDefined';
import { isSubDirectory } from './isSubdirectory';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientClass } from './writeClientClass';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param clientName Custom client class name
 * @param request Path to custom request file
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    output: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    exportPackages: boolean,
    indent: Indent,
    postfixServices: string,
    postfixModels: string,
    clientName?: string,
    request?: string
): Promise<void> => {
    const outputPath = resolve(process.cwd(), output);
    const outputPathCore = resolve(output, 'core');

    if (!exportServices) client.services = [];
    if (!exportModels) client.models = [];
    if (!exportSchemas) client.schemas = [];

    const packages = collectPackages(client, exportPackages);

    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    if (exportCore) {
        await writeClientCore(client, templates, outputPathCore, httpClient, indent, clientName, request);
    }

    for (const [pkg, { services, models, schemas }] of packages.entries()) {
        await writeClientServices(
            services,
            templates,
            outputPath,
            httpClient,
            useUnionTypes,
            useOptions,
            indent,
            clientName
        );

        await writeClientModels(models, templates, outputPath, httpClient, useUnionTypes, indent);
        await writeClientSchemas(schemas, templates, outputPath, httpClient, useUnionTypes, indent);

        const pkgClient = {
            ...client,
            services: services,
            models: models,
            schemas: schemas,
        };
        const exportClient = isDefined(clientName) && !!services.length;

        // fully qualified client name, file and type are named the same
        const pkgClientName = [pkg, clientName, clientName].filter(p => !!p).join('.');

        if (exportClient) {
            await writeClientClass(pkgClient, templates, outputPath, httpClient, pkgClientName, indent);
        }

        if (!!services.length || !!models.length || !!schemas.length) {
            // fully qualified index name, to facilitate generating imports
            const name = [pkg, 'index', 'index'].filter(p => !!p).join('.');
            await writeClientIndex(
                pkgClient,
                name,
                templates,
                outputPath,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportSchemas,
                exportClient,
                postfixServices,
                postfixModels,
                pkgClientName
            );
        }
    }
};

const collectPackages = (
    client: Client,
    exportPackages: boolean
): Map<string, { services: Service[]; models: Model[]; schemas: Model[] }> => {
    if (!exportPackages) {
        return new Map().set('', { services: client.services, models: client.models, schemas: client.schemas });
    }

    const packages = new Map<string, { services: Service[]; models: Model[]; schemas: Model[] }>();
    for (const service of client.services) {
        const path = service.name.split('.').slice(0, -2).join('.');
        const pkg = packages.get(path) || {
            models: [],
            services: [],
            schemas: [],
        };
        pkg.services.push(service);
        packages.set(path, pkg);
    }

    for (const model of client.models) {
        const path = model.name.split('.').slice(0, -2).join('.');
        const pkg = packages.get(path) || {
            models: [],
            services: [],
            schemas: [],
        };
        pkg.models.push(model);
        packages.set(path, pkg);
    }

    for (const schema of client.schemas) {
        const path = schema.name.split('.').slice(0, -2).join('.');
        const pkg = packages.get(path) || {
            models: [],
            services: [],
            schemas: [],
        };
        pkg.schemas.push(schema);
        packages.set(path, pkg);
    }

    return packages;
};
