export const postProcessModelName = (name: string, pkg: string, fullyQualifiedNames: boolean): string => {
    if (!fullyQualifiedNames) {
        name = `${name}`.replace(/\./g, '_');
        return [pkg, name, name].filter(part => !!part).join('.');
    }

    // split package into its parts
    const split = name.split('.');

    // because each type will live in its own file, push the last part again
    // so this is a reference to the type itself rather than the containing file
    split.push(split[split.length - 1]);

    // join with containing package
    return [pkg, ...split].filter(part => !!part).join('.');
};
