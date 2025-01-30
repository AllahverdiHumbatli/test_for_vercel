import express from "express";
import {routersPaths} from "./common/path/paths";
import {authRouter} from "./auth/auth.router";
import {usersRouter} from "./users/api/users.router";

export const initApp = () => {
    const app = express()

    app.use(express.json())
    app.use(routersPaths.common, authRouter)
    app.use(routersPaths.users, usersRouter)

    return app
}