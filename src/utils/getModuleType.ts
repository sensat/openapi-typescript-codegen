export const getModuleType = (name: string): string => {
    const parts = name.split('.');
    return parts[parts.length - 1];
};
