import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import {registerRoutes} from "./routes/routes";



const PORT = process.env.PORT || 8000;


    // create express app
    const app = express();
    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());



    // register express routes from defined application routes
    const routes=registerRoutes(app);

    // await connection.runMigrations();
    // start express server
    app.listen(PORT);

    console.log("Express server has started on port 3000");
