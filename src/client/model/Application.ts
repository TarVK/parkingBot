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
     * @param walkCost How expensive it is to walk 1 meter compared to driving 1 meter
     * @param turnCost How expensive it is to turn 90 degrees compared to driving 1 meter
     * @returns The path
     */
    public getParkingSpot(
        walkCost: number = 1,
        turnCost: number = 0
    ): Promise<string[] | undefined> {
        // return this.socket.emitAsync("getSpot", {walkCost: 0.99, turnCost: 0});
        // return this.socket.emitAsync("getSpot", {walkCost: 1, turnCost: 0});
        // return this.socket.emitAsync("getSpot", {walkCost: 1.01, turnCost: 0});
        // return this.socket.emitAsync("getSpot", {walkCost: 1.5, turnCost: 5});
        return this.socket.emitAsync("getSpot", {walkCost, turnCost});
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
