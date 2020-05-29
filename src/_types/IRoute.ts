export type IPath = string[];
export type IRoute = {
    car: [IPath, IPath, IPath, IPath];
    bot: {
        pointDir: number;
        path: [IPath, IPath];
    };
};
