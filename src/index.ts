import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

export type Options = {
    input: string | Record<string, any>;
    output: string;
    serviceOutput?: string;
    modelOutput?: string;
    schemaOutput?: string;
    httpClient?: HttpClient;
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    fullyQualifiedNames?: boolean;
    exportPackages?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    indent?: Indent;
    postfixServices?: string;
    postfixModels?: string;
    request?: string;
    write?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param request Path to custom request file
 * @param write Write the files to disk (true or false)
 */
export const generate = async ({
    input,
    output,
    serviceOutput = 'services',
    modelOutput = 'models',
    schemaOutput = 'schemas',
    fullyQualifiedNames = false,
    httpClient = HttpClient.FETCH,
    clientName,
    useOptions = false,
    useUnionTypes = false,
    exportCore = true,
    exportServices = true,
    exportModels = true,
    exportSchemas = false,
    exportPackages = false,
    indent = Indent.SPACE_4,
    postfixServices = 'Service',
    postfixModels = '',
    request,
    write = true,
}: Options): Promise<void> => {
    const servicePkg = serviceOutput.split('/').join('.');
    const modelPkg = modelOutput.split('/').join('.');
    const schemaPkg = schemaOutput.split('/').join('.');

    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parseV2(openApi);
            const clientFinal = postProcessClient(
                client,
                servicePkg,
                postfixServices,
                modelPkg,
                schemaPkg,
                fullyQualifiedNames
            );
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportSchemas,
                exportPackages,
                indent,
                postfixServices,
                postfixModels,
                clientName,
                request
            );
            break;
        }

        case OpenApiVersion.V3: {
            const client = parseV3(openApi);
            const clientFinal = postProcessClient(
                client,
                servicePkg,
                postfixServices,
                modelPkg,
                schemaPkg,
                fullyQualifiedNames
            );
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportSchemas,
                exportPackages,
                indent,
                postfixServices,
                postfixModels,
                clientName,
                request
            );
            break;
        }
    }
};

export default {
    HttpClient,
    generate,
};
