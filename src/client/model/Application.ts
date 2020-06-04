import {IDataHook, DataLoader, Field, LoadableField, getAsync} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {INormalizedParkingGraph} from "../../_types/graph/IParkingGraph";
import {Bot} from "./bot/Bot";
import {ForeignEntityManager} from "./entities/ForeignEntityManager";
import {Car} from "./entities/Car";
import {wait} from "../../services/wait";
import {Person} from "./entities/Person";
import {getDistance} from "./entities/getMinDistance";
import {ICarEntity} from "../../_types/IForeignEntity";
import {uuid} from "uuidv4";
import {IRoute} from "../../_types/IRoute";

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

    protected route = new Field(null as IRoute | null);
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

    /**
     * Retrieves the rout that the bot of this client is currently handling
     * @param hook The hook to subscribe to changes
     * @returns The rout if any
     */
    public getRoute(hook: IDataHook): IRoute | null {
        return this.route.get(hook);
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
     * Looks for any customers that are waiting, and helps them to a spot if found
     */
    public async lookForCustomers(): Promise<void> {
        const bot = this.getControllableBot(null);
        if (bot && !bot.isBusy(null)) {
            const entities = this.getEntityManager().getEntities(null);
            const car = entities
                .filter(e => e.type == "car" && !(e as any).helped)
                .find(e => getDistance(e.pos, bot.getPosition(null).physical) < 3.5);
            if (car) await this.guideCustomer(car as ICarEntity);
        }
    }

    /**
     * Guides a car to their parking spot
     * @param customer The car to guide
     */
    public async guideCustomer(customer: ICarEntity): Promise<void> {
        const bot = await getAsync(h => this.getControllableBot(h));

        // Get the entrance to add the car to
        const graph = await getAsync(h => this.getParkingGraph(h));
        if (!graph || !bot) return;

        // Create the car to guide
        const car = new Car(customer.ID);
        // console.log(customer.ID, car);

        // Obtain a spot and guide the car to it
        const route = await bot.findAndClaimSpot(
            customer.preferences.walkCost,
            customer.preferences.turnCost
        );
        if (!route) {
            // Handle lot being full
            return;
        }
        this.route.set(route);

        const peopleCount = Math.floor(Math.random() * 4) + 1;
        car.followPath(route.car[0]).then(async () => {
            await wait(2500);

            // Let people leave the lot
            await this.createPeople(peopleCount, route.car[1], car);

            // Wait for a random period before letting people return
            await wait((Math.random() * 60 * 5 + 20) * 1000);

            // Let the people enter the car again
            await this.createPeople(peopleCount, route.car[2], car);

            // Let the car leave the garage
            await car.followPath(route.car[3]);

            // Cleanup
            car.destroy();
            this.releaseSpace(route.car[3][0]);
        });

        await wait(10).then(() => bot.guideToSpot(car.getID(), route));
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
        for (var i = 0; i < count; i++) {
            const person = new Person(this.graph[path[0]]);
            person.addIgnoreEntity(car.getID());
            promises.push(person.followPath(path).then(() => person.destroy()));
        }
        await Promise.all(promises);
    }

    /**
     * Adds a customer to the simulation, and coordinates the process of finding a spot for that customer
     * @param walkCost The walk cost
     * @param turnCost The turn cost
     * @returns A promise that resolves once the customer exited the lot
     */
    public async addCustomer(walkCost: number, turnCost: number): Promise<void> {
        const graph = await getAsync(h => this.getParkingGraph(h));
        if (!graph) return;

        const entranceIDs = Object.keys(graph).filter(ID =>
            graph[ID].tags.includes("entrance")
        );
        const entranceID = entranceIDs[Math.floor(Math.random() * entranceIDs.length)];
        const entrance = graph[entranceID];

        this.getEntityManager().addEntity({
            ID: uuid(),
            size: {height: 4, width: 2},
            pos: entrance,
            type: "car",
            rotation: 0,
            preferences: {turnCost, walkCost},
            helped: false,
        });
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
