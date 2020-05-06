export type TNormalized<T extends object> = {[K in keyof T]-?: T[K]};
