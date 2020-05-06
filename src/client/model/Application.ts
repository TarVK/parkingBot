import {ActionState, IDataHook, DataLoader} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";

export class ApplicationClass extends SocketModel {
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
     * // TODO: remove this test method
     * Retrieves a free parking spot
     * @returns The graph
     */
    public getParkingSpot(): Promise<
        {spotPath: string[]; exitPath: string[]} | undefined
    > {
        // return this.socket.emitAsync("getSpot", {walkCost: 0.99, turnCost: 0});
        // return this.socket.emitAsync("getSpot", {walkCost: 1, turnCost: 0});
        // return this.socket.emitAsync("getSpot", {walkCost: 1.01, turnCost: 0});
        return this.socket.emitAsync("getSpot", {walkCost: 1.5, turnCost: 5});
        // return this.socket.emitAsync("getSpot");
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
