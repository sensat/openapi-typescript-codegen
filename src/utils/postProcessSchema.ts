import { Model } from '../client/interfaces/Model';
import { postProcessSchemaName } from './postProcessSchemaName';

export const postProcessSchema = (schema: Model, pkg: string, fullyQualifiedNames: boolean): Model => {
    return {
        ...schema,
        name: postProcessSchemaName(schema.name, pkg, fullyQualifiedNames),
    };
};
