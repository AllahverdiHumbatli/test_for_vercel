import {Db, MongoClient} from "mongodb";
import {appConfig} from "./common/config/config";
import {IUser} from "./users/domain/domain-types/user.db.interface";

export const db = {
    client: {} as MongoClient,

    getDbName(): Db {
        return this.client.db(appConfig.DB_NAME);
    },
    async run(url: string) {
        try {
            this.client = new MongoClient(url)
            await this.client.connect();
            await this.getDbName().command({ping: 1});
            console.log("Connected successfully to mongo server");
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await this.client.close();
        }

    },
    async stop() {
        await this.client.close();
        console.log("Connection successful closed");
    },
    async drop() {
        try {
            //await this.getDbName().dropDatabase()
            const collections = await this.getDbName().listCollections().toArray();

            for (const collection of collections) {
                const collectionName = collection.name;
                await this.getDbName().collection(collectionName).deleteMany({});
            }
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    },
    getCollections() {
        return {
            usersCollection: this.getDbName().collection<IUser>("users")
            //blogsCollection:

            //...all collections
        }
    }

}


//export const usersCollection = db.getDbName().collection<IUserDB>("users");