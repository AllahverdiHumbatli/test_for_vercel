import {Request, Response} from 'express'
import {appConfig} from "./common/config/config";
import {initApp} from "./initApp";
import {db} from "./db";

const app = initApp()

app.get('/', (req: Request, res: Response) => {
    res.send(`newest`)
})

const startApp = async () => {
    await db.run(appConfig.MONGO_URL)
    app.listen(appConfig.PORT, () => {
        console.log(`Example app listening on port ${appConfig.PORT}`)
    })
    return app
}
startApp();

