import MainController from "../controller/MainController";
import { Router, Application } from 'express'


const publicRoutes = [{
    route: "/",
    controller: MainController,
}
];


export const registerRoutes = (app: Application): void => {
    const routesV1 = Router();

    publicRoutes.map(({ route, controller }) => {
        routesV1.use(route, controller())
    })

    app.use('/', routesV1);
}