export type ISymmetricEdge<E> = {
    start: string;
    end: string;
    weight: number;
    meta: E;
};
