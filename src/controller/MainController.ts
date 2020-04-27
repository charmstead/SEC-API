import { NextFunction, Request, Response, Router } from "express";
import axios,{AxiosPromise} from 'axios';
import { fetchFilings } from "../services/Fetch";

const API_KEY = `8095b689f51de4b31d951798eb7e54f2b1dffc88454b10870fb86795539f7066`;


export default () => {


    const router = Router();

    router.post('/filings', async (req: Request, res: Response, next: NextFunction) => {

        const {ticker,filedAt} =req.body;
       const filings= await fetchFilings({ticker,filedAt});
        return res.send(filings);

    })
    return router;
}
