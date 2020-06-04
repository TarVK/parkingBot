import {IForeignEntity} from "../../../_types/IForeignEntity";
import {Application} from "../Application";
import {getAsync} from "model-react";
import {Bot} from "../bot/Bot";

// TODO: consider rotation of entities

/**
 * Retrieves the minimum distance between a given position and all existing entities
 * @param pos The position to check at
 * @param filter A filter to exclude entities in the calculation
 * @param distMultiplier A multiplier for the distance
 * @returns The minimum distance to any other entity
 */
export const getMinimumDistance = async (
    pos: {x: number; y: number},
    filter: (ent: Bot | IForeignEntity) => boolean = () => true,
    distMultiplier: (ent: Bot | IForeignEntity) => number = () => 1
) => {
    const bots = (await getAsync(h => Application.getBots(h)))?.filter(filter) || [];
    const entities =
        (await (
            await getAsync(h => Application.getEntityManager().getEntities(h))
        )?.filter(filter)) || [];

    let minDistance = Infinity;
    bots.forEach(bot => {
        const p = bot.getPosition(null);
        const dx = pos.x - p.physical.x;
        const dy = pos.y - p.physical.y;
        const dist = distMultiplier(bot) * Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) minDistance = dist;
    });
    entities.forEach(entity => {
        const p = entity.pos;
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        const dist = distMultiplier(entity) * Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) minDistance = dist;
    });
    return minDistance;
};

/**
 * Calculates the distance between two points
 * @param pos1 The first point
 * @param pos2 The second point
 * @returns The euclidean distance
 */
export const getDistance = (
    pos1: {x: number; y: number},
    pos2: {x: number; y: number}
) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
};
