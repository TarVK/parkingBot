import {Server as HTTPServer} from "http";
import {AsyncSocketConnection} from "./AsyncSocketConnection";
import {ParkingLot} from "./model/ParkingLot";
import {lot} from "./parkingLots/lot2";
import {Bot} from "./model/Bot";
import {Car} from "./model/Car";

const parkingLot = new ParkingLot(lot);

// Connection management
const connections: AsyncSocketConnection[] = [];
export function broadcast(message: any, ...args: string[]) {
    connections.forEach(conn => conn.emit(message, ...args));
}

/**
 * Sets up the API for a socket
 * @param socket The socket to setup the api listeners for
 */
function setupAPI(socket: AsyncSocketConnection) {
    // Setup interaction
    let bot = null as null | Bot;
    socket.on("addBot", () => {
        bot = new Bot(socket);
        parkingLot.addBot(bot);
        return bot.getID();
    });
    socket.on("disconnect", () => {
        if (bot) parkingLot.removeBot(bot);
    });

    // Updating state interaction
    socket.on("claimSpace", (spaceID: string) => {
        return parkingLot.claimSpace(spaceID);
    });
    socket.on("disclaimSpace", (spaceID: string) => {
        return parkingLot.disclaimSpace(spaceID);
    });
    socket.on("takeSpace", (spaceID: string) => {
        // TODO: Make proper car object with relevant data
        return parkingLot.takeSpace(spaceID, new Car());
    });
    socket.on("releaseSpace", (spaceID: string) => {
        return parkingLot.releaseSpace(spaceID);
    });

    // General state interaction
    socket.on("getGraph", () => {
        return parkingLot.getGraph();
    });
    socket.on("getSpot", ({entranceID, turnCost, walkCost}) => {
        return parkingLot.findFreeSpot(entranceID, turnCost, walkCost);
    });
}

/**
 * Starts the socket server
 * @param server The http server to use, or undefined to let the socket create its own server
 */
export async function startApplication(server?: HTTPServer): Promise<void> {
    // Start the socket server
    AsyncSocketConnection.startServer((con: AsyncSocketConnection) => {
        // Connection management
        connections.push(con);
        con.on("disconnect", () => {
            const index = connections.indexOf(con);
            if (index !== -1) connections.slice(index, 1);
        });

        // Setup all listeners to handle API requests
        setupAPI(con);
    }, server);
}
