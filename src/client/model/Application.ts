import {IDataHook, DataLoader, Field, LoadableField, getAsync} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./bot/Bot";
import {ForeignEntityManager} from "./entities/ForeignEntityManager";
import {Car} from "./entities/Car";
import {wait} from "../../services/wait";
import {Person} from "./entities/Person";

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
    protected entityManager = new ForeignEntityManager();

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

    /**
     * Retrieves the foreign entity manager, used to track cars and pedestrians (foreign to the system)
     * @returns The foreign entity manager
     */
    public getEntityManager(): ForeignEntityManager {
        return this.entityManager;
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

    // Methods to guide the simulation
    /**
     * Adds a customer to the simulation, and coordinates the process of finding a spot for that customer
     * @param walkCost The walk cost
     * @param turnCost The turn cost
     * @returns A promise that resolves once the customer exited the lot
     */
    public async addCustomer(walkCost: number, turnCost: number): Promise<void> {
        const bot = await getAsync(h => this.getControllableBot(h));

        // Get the entrance to add the car to
        const graph = await getAsync(h => this.getParkingGraph(h));
        if (!graph || !bot) return;
        const entranceIDs = Object.keys(graph).filter(ID =>
            graph[ID].tags.includes("entrance")
        );
        const entranceID = entranceIDs[Math.floor(Math.random() * entranceIDs.length)];
        const entrance = graph[entranceID];

        // Create the car to guide
        const car = new Car(entrance, entrance.edges[0].angle);

        // Obtain a spot and guide the car to it
        const route = await bot.findAndClaimSpot(walkCost, turnCost);
        if (!route) {
            // Handle lot being full
            return;
        }

        const peopleCount = Math.floor(Math.random() * 4) + 1;
        wait(500).then(() => {
            bot.guideToSpot(car.getID(), route);
        });
        car.followPath(route.car[0]).then(async () => {
            // Let people leave the lot
            await this.createPeople(peopleCount, route.car[1], car);

            // Wait for a random period before letting people return
            await wait((Math.random() * 10 + 5) * 1000);

            // Let the people enter the car again
            await this.createPeople(peopleCount, route.car[2], car);

            // Let the car leave the garage
            await car.followPath(route.car[3]);

            // Cleanup
            car.destroy();
            this.releaseSpace(route.car[3][0]);
        });
    }

    /**
     * Creates people and lets them follow a path
     * @param count The number of people to create
     * @param path The path to follow
     * @param car The car that the people come from
     * @returns A promise that resolves when the people are gone
     */
    protected async createPeople(count: number, path: string[], car: Car): Promise<void> {
        let promises = [] as Promise<void>[];
        let people = [] as Person[];
        for (var i = 0; i < count; i++) {
            const person = new Person(this.graph[path[0]]);
            person.addIgnoreEntity(car.getID());
            people.push(person);
            promises.push(person.followPath(path).then(() => person.destroy()));
        }
        people.forEach(p => people.forEach(c => p.addIgnoreEntity(c.getID())));
        await Promise.all(promises);
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
