import {AsyncSocketConnection} from "../AsyncSocketConnection";

export class Bot {
    protected socket: AsyncSocketConnection;

    /**
     * Creates a new bot with the specified socket
     * @param socket The socket to communicate with the bot
     */
    public constructor(socket: AsyncSocketConnection) {
        this.socket = socket;
    }

    /**
     * Emits a message to the bot
     * @param message The message to send to the bot
     * @param args The arguments to send
     */
    public emit(message: string, ...args: any[]) {
        this.socket.emit(message, ...args);
    }
}
