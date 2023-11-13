// remove last element because it's a reference to the type
export const getModulePath = (name: string): string => name.split('.').slice(0, -1).join('/');
