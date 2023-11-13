import camelcase from 'camelcase';

export const postProcessServiceName = (
    name: string,
    pkg: string,
    postfix: string,
    fullyQualifiedNames: boolean
): string => {
    if (!fullyQualifiedNames) {
        name = camelcase(`${name}${postfix}`, { pascalCase: true });
        return [pkg, name, name].filter(part => !!part).join('.');
    }

    // split package into its parts
    const split = name.split('.');

    // ensure postfix is part of the name
    split[split.length - 1] = `${split[split.length - 1]}${postfix}`;

    // because each type will live in its own file, push the last part again
    // so this is a reference to the type itself rather than the containing file
    split.push(split[split.length - 1]);

    // join with containing package
    return [pkg, ...split].filter(part => !!part).join('.');
};
