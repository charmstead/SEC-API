import { NextFunction, Request, Response, Router } from "express";
import { fetchFilings } from "../services/Fetch";



export default () => {


    const router = Router();

    router.post('/filings', async (req: Request, res: Response, next: NextFunction) => {

        const {ticker,filedAt} =req.body;
       const filings= await fetchFilings({ticker,filedAt});
        return res.send(filings);

    })

    router.get('/filings', async (req: Request, res: Response, next: NextFunction) => {

        const {ticker,filedAt} =req.query;
       const filings= await fetchFilings({ticker,filedAt});
        return res.send(filings);

    })
    return router;
}
