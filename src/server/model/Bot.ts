import {AsyncSocketConnection} from "../AsyncSocketConnection";
import {ISome} from "../../_types/ISome";

export class Bot {
    protected socket: AsyncSocketConnection;

    /**
     * Creates a new bot with the specified socket
     * @param socket The socket to communicate with the bot
     */
    public constructor(socket: AsyncSocketConnection) {
        this.socket = socket;
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
