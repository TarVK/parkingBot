/**
 * Checks whether any of the needles are present in the haystack
 * @param haystack The haystack
 * @param needles The needles
 */
export function includesAny<T>(haystack: T[] | Readonly<T[]> | undefined, needles: T[]) {
    return needles.reduce(
        (found, needle) => found || haystack?.includes(needle) || false,
        false
    );
}

/**
 * Checks whether all of the needles are present in the haystack
 * @param haystack The haystack
 * @param needles The needles
 */
export function includesAll<T>(haystack: T[] | Readonly<T[]> | undefined, needles: T[]) {
    return needles.reduce(
        (foundAll, needle) => foundAll && (haystack?.includes(needle) ?? false),
        true
    );
}
