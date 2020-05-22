import {IDataHook, DataLoader} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./bot/Bot";

export class ApplicationClass extends SocketModel {
    protected bot = new DataLoader<Bot | undefined>(() => Bot.create(), undefined);
    protected graph = new DataLoader<INormalizedParkingGraph | undefined>(
        () => this.socket.emitAsync("getGraph"),
        undefined
    );

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
    public getBot(hook: IDataHook): Bot | undefined {
        return this.bot.get(hook);
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
