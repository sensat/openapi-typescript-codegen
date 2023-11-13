import camelCase from 'camelcase';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';
import path, { basename, dirname } from 'path';

import type { Enum } from '../client/interfaces/Enum';
import type { Model } from '../client/interfaces/Model';
import type { HttpClient } from '../HttpClient';
import { getModulePath } from './getModulePath';
import { getModuleType } from './getModuleType';
import { unique } from './unique';

export const registerHandlebarHelpers = (root: {
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
}): void => {
    Handlebars.registerHelper('ifdef', function (this: any, ...args): string {
        const options = args.pop();
        if (!args.every(value => !value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper(
        'equals',
        function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
            return a === b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'notEquals',
        function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
            return a !== b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'containsSpaces',
        function (this: any, value: string, options: Handlebars.HelperOptions): string {
            return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'union',
        function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const type = Handlebars.partials['type'];
            const parentType = getModuleType(parent || '');
            const types = properties.map(property => type({ ...root, ...property, parent: parentType }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' | ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper(
        'intersection',
        function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const type = Handlebars.partials['type'];
            const parentType = getModuleType(parent || '');
            const types = properties.map(property => type({ ...root, ...property, parent: parentType }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' & ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper(
        'enumerator',
        function (
            this: any,
            enumerators: Enum[],
            parent: string | undefined,
            name: string | undefined,
            options: Handlebars.HelperOptions
        ) {
            if (!root.useUnionTypes && parent && name) {
                const parentType = getModuleType(parent);
                return `${parentType}.${name}`;
            }
            return options.fn(
                enumerators
                    .map(enumerator => enumerator.value)
                    .filter(unique)
                    .join(' | ')
            );
        }
    );

    Handlebars.registerHelper('escapeComment', function (value: string): string {
        return value
            .replace(/\*\//g, '*')
            .replace(/\/\*/g, '*')
            .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
    });

    Handlebars.registerHelper('getModuleType', getModuleType);

    Handlebars.registerHelper('generateImportType', (source: string, target: string, targetAlias?: string): string => {
        if (typeof targetAlias !== 'string') targetAlias = '';
        return generateDirective('import type', source, target, targetAlias || '', false);
    });

    Handlebars.registerHelper('generateImport', (source: string, target: string, targetAlias?: string): string => {
        if (typeof targetAlias !== 'string') targetAlias = '';
        return generateDirective('import', source, target, targetAlias || '', false);
    });

    Handlebars.registerHelper('generateExportType', (source: string, target: string): string =>
        generateDirective('export type', source, target, '', false)
    );

    Handlebars.registerHelper('generateExport', (source: string, target: string): string =>
        generateDirective('export', source, target, '', false)
    );

    Handlebars.registerHelper('generateSchemaExport', (source: string, target: string): string =>
        generateDirective('export', source, target, '', true)
    );

    Handlebars.registerHelper('concat', (...args) => args.slice(0, -1).join(''));

    Handlebars.registerHelper('escapeDescription', function (value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    });

    Handlebars.registerHelper('camelCase', function (value: string): string {
        return camelCase(value);
    });
};

const generateDirective = (
    directive: string,
    source: string,
    target: string,
    targetAlias: string,
    isSchema: boolean
): string => {
    const sourceModulePath = getModulePath(source);
    const targetModulePath = getModulePath(target);

    let relative = path.relative(`./${dirname(sourceModulePath)}`, `./${dirname(targetModulePath)}`) || `.`;

    // all imports should be relative but path.relative('.', 'some/path') returns
    // `some/path`. Ensure these paths all start with './' at least.
    if (!relative.startsWith('.')) {
        relative = `./${relative}`;
    }

    let typeName = getModuleType(target);
    if (isSchema) {
        typeName = `$${typeName}`;
    }

    let aliased = typeName;
    if (targetAlias !== '') {
        aliased = `${typeName} as ${targetAlias}`;
    }

    return `${directive} { ${aliased} } from '${relative}/${basename(targetModulePath)}';`;
};
