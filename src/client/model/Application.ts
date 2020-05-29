import {IDataHook, DataLoader, Field, LoadableField} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./bot/Bot";

export class ApplicationClass extends SocketModel {
    protected bot = new DataLoader<Bot | undefined>(async () => {
        const bot = await Bot.create();

        // Add the bot to the bots list, making sure that a previously externally created version is deleted
        this.bots.set([
            ...this.bots.get(null).filter(b => {
                const same = b.getID() == bot.getID();
                if (same) b.destroy();
                return !same;
            }),
            bot,
        ]);

        return bot;
    }, undefined);

    protected bots = new Field([] as Bot[]);
    protected graph = new DataLoader<INormalizedParkingGraph | undefined>(
        () => this.socket.emitAsync("getGraph"),
        undefined
    );

    /**
     * Creates a new application
     */
    public constructor() {
        super();

        const addBot = async (id: string) => {
            const bot = await Bot.create(id);
            const bots = this.bots.get(null);
            if (bots.find(b => b.getID() == id)) return;
            this.bots.set([...bots, bot]);
        };
        this.socket.on("bots", async ids => {
            await Promise.all(ids.map(addBot));
        });
        this.socket.on("addBot", addBot);
        this.socket.on("removeBot", async id => {
            this.bots.set([
                ...this.bots.get(null).filter(b => {
                    const same = b.getID() == id;
                    if (same) b.destroy();
                    return !same;
                }),
            ]);
        });
    }

    /**
     * Retrieves the parking graph
     * @param hook The hook to subscribe to changes
     * @returns The graph
     */
    public getParkingGraph(hook: IDataHook): INormalizedParkingGraph | undefined {
        return this.graph.get(hook);
    }

    /**
     * Retrieves the bot that this client represents/simulates
     * @param hook The hook to subscribe to changes
     * @returns The bot
     */
    public getControllableBot(hook: IDataHook): Bot | undefined {
        return this.bot.get(hook);
    }

    /**
     * Retrieves all the bots in the parking lot
     * @param hook The hook to subscribe to changes
     * @returns All the bots
     */
    public getBots(hook: IDataHook): Bot[] {
        return this.bots.get(hook);
    }

    // Some methods that can be used to manually alter the parking lot and see the effects
    /**
     * Claims the specified spot
     * @param spotID The spot to claim
     * @returns Whether the spot could be claimed
     */
    public async claimSpace(spotID: string): Promise<boolean> {
        return this.socket.emitAsync("claimSpace", spotID);
    }

    /**
     * Disclaims the specified spot
     * @param spotID The spot to disclaim
     */
    public async disclaimSpace(spotID: string): Promise<void> {
        return this.socket.emitAsync("disclaimSpace", spotID);
    }

    /**
     * Takes the specified spot
     * @param spotID The spot to take
     */
    public async takeSpace(spotID: string): Promise<void> {
        return this.socket.emitAsync("takeSpace", spotID);
    }

    /**
     * Releases the specified spot
     * @param spotID The spot to release
     */
    public async releaseSpace(spotID: string): Promise<void> {
        return this.socket.emitAsync("releaseSpace", spotID);
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
