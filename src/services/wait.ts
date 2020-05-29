/**
 * Creates a promise that resolves after a given delay
 * @param time THe delay
 * @returns The promise
 */
export const wait = (time: number = 200) => new Promise(res => setTimeout(res, time));
