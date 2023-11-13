import { Model } from '../client/interfaces/Model';
import { postProcessModelName } from './postProcessModelName';

export const postProcessModelProperty = (prop: Model, pkg: string, fullyQualifiedNames: boolean): Model => {
    return {
        ...prop,
        properties: prop.properties.map(prop => postProcessModelProperty(prop, pkg, fullyQualifiedNames)),
        base: postProcessModelName(prop.base, pkg, fullyQualifiedNames),
    };
};
