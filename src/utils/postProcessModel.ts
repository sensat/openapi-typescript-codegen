import type { Model } from '../client/interfaces/Model';
import { postProcessModelEnum } from './postProcessModelEnum';
import { postProcessModelEnums } from './postProcessModelEnums';
import { postProcessModelImports } from './postProcessModelImports';
import { postProcessModelName } from './postProcessModelName';
import { postProcessModelProperty } from './postProcessModelProperty';

/**
 * Post processes the model.
 * This will clean up any double imports or enum values.
 * @param model
 */
export const postProcessModel = (model: Model, pkg: string, fullyQualifiedNames: boolean): Model => {
    return {
        ...model,
        properties: model.properties.map(prop => postProcessModelProperty(prop, pkg, fullyQualifiedNames)),
        name: postProcessModelName(model.name, pkg, fullyQualifiedNames),
        imports: postProcessModelImports(model, pkg, fullyQualifiedNames),
        enums: postProcessModelEnums(model),
        enum: postProcessModelEnum(model),
    };
};
