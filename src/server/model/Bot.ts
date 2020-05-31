import {AsyncSocketConnection} from "../AsyncSocketConnection";
import {ISome} from "../../_types/ISome";
import {ParkingLot} from "./ParkingLot";
import {uuid} from "uuidv4";
import {IBotPosition} from "../../_types/IBotPosition";

export class Bot {
    protected socket: AsyncSocketConnection;
    protected lot: ParkingLot;
    protected ID: string = uuid();
    protected position: IBotPosition = {
        graph: null,
        physical: {x: 0, y: 0, rotation: 0},
    };

    /**
     * Creates a new bot with the specified socket
     * @param socket The socket to communicate with the bot
     */
    public constructor(socket: AsyncSocketConnection) {
        this.socket = socket;
        socket.on(`bot-${this.getID()}/pos`, position => this.setPosition(position));
    }

    /**
     * Retrieves the ID of this bot
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    // Data management
    /**
     * Retrieves the position of the robot
     * @returns The position
     */
    public getPosition(): IBotPosition {
        return this.position;
    }

    /**
     * Sets the position of the bot
     * @param position The new position
     */
    public setPosition(position: IBotPosition): void {
        this.position = position;
        if (this.lot) this.lot.broadcast(`bot-${this.getID()}/pos`, this.position);
    }

    // Lot management
    /**
     * Set the lot that this bot belongs to
     * @param lot The lot
     */
    public setLot(lot: ParkingLot): void {
        this.lot = lot;
    }

    /**
     * Retrieve the lot that this bot belongs to
     * @returns The lot
     */
    public getLot(): ParkingLot {
        return this.lot;
    }

    /**
     * Shares the data of this bot with the given bot
     * @param bot The bot to share the data with
     */
    public shareInitialDataWith(bot: Bot): void {
        bot.emit(`bot-${this.getID()}/pos`, this.position);
    }

    // Utils
    /**
     * Makes the bot follow a path
     * @param path The path to follow
     */
    public followPath(path: string[]): void {
        this.emit(`bot-${this.getID()}/followPath`, path);
    }

    // Robot interaction
    /**
     * Emits a message to the bot
     * @param message The message to send to the bot
     * @param args The arguments to send
     */
    public emit(message: string, ...args: any[]) {
        this.socket.emit(message, ...args);
    }

    /**
     * Adds a listener to a specific message
     * @param message The message to add the listener to
     * @param listener The listener to be added
     * @param label A label for the added listener
     */
    public on<T extends any[], R extends ISome>(
        message: string,
        listener: (...args: T) => void | R | Promise<R>,
        label: string = ""
    ): void {
        this.socket.on(message, listener, label);
    }

    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param listener The listener to be removed
     */
    public off<T extends any[]>(message: string, listener: (...args: T) => void): void;

    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param label The label of the listener to be removed
     */
    public off<T extends any[]>(message: string, label: string): void;
    public off<T extends any[]>(
        message: string,
        listener: string | ((...args: T) => void)
    ): void {
        this.socket.off(message, listener as any);
    }
}
