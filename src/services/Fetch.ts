import axios from 'axios';


const parser = require('xml-js');

const API_KEY = `8095b689f51de4b31d951798eb7e54f2b1dffc88454b10870fb86795539f7066`;




export const fetchFilings = async ({ ticker, filedAt }): Promise<any> => {

    const query = getQueryObject({ ticker, filedAt });

    const data: SecData = await axios.post(`https://api.sec-api.io?token=${API_KEY}`, query).then(x => x.data);

   return await xmlLinksToAxiosRequest(data.filings);


}


const xmlLinksToAxiosRequest = async (filings: Filing[]) => {
    const request = filings.map(({ linkToTxt },idx) => (
        axios.get(linkToTxt)
        .then(x => x.data)
        .then(data=>parse(data, filings[idx].companyName))
        .catch(x => { })
    ));

    return await Promise.all(request);
}



const parse = (xml: string, ticker: string): Array<parsedData> => {
    const options = {
        compact: true,
        ignoreDeclaration: true,
        ignoreComment: true,
        spaces: 4
    };

    const derivativeTable = xml.match(/<derivativeTable>(.|\n)*?<\/derivativeTable>/);
    const nonDerivativeTable = xml.match(/<nonDerivativeTable>(.|\n)*?<\/nonDerivativeTable>/);

    const json = parser.xml2json(derivativeTable[0], options);
    const json2 = parser.xml2json(nonDerivativeTable[0], options);

    return [
        parseTable(JSON.parse(json2), 'nonDerivativeTable', ticker),
        parseTable(JSON.parse(json), 'derivativeTable', ticker)
    ]

}



const parseTable = (table, type: string, ticker: string):parsedData => {

    const transaction = type == 'derivativeTable' ? 'derivativeTransaction' : 'nonDerivativeTransaction';
    const nonDerive = table[type][transaction].filter(({ transactionCoding }) => {
        return /(p|s)/gi.test(transactionCoding.transactionCode._text)
    })

    return nonDerive.reduce((acc, { transactionAmounts }) => {

        const { transactionPricePerShare, transactionShares } = transactionAmounts;

        const shares = transactionShares.value ? transactionShares.value._text : 0
        const pershares = transactionPricePerShare.value ? transactionPricePerShare.value._text : 0

        const mul = parseFloat(shares) * parseFloat(pershares);
        const v = transactionAmounts.transactionAcquiredDisposedCode.value._text;

        acc[v] += mul;

        return acc;

    }, { transaction, ticker, A: 0, D: 0 })
}



type parsedData = {
    transaction: string,
    ticker: string,
    A: number,
    D: number
}

interface SecData {
    total: Total;
    filings: Filing[];
}

interface Filing {
    id: string;
    cik: string;
    ticker: string;
    companyName: string;
    companyNameLong: string;
    formType: string;
    description: string;
    filedAt: Date;
    linkToTxt: string;
    linkToHtml: string;
    linkToXbrl: string;
    linkToFilingDetails: string;
}

interface Total {
    value: number;
    relation: string;
}

const getQueryObject = ({ ticker = 'AAPL', filedAt = '2020-04-17' }) => {

    return {
        "query": {
            "query_string": {
                "query": `ticker: ${ticker} AND formType:4 AND formType:(NOT \"N-4\") AND formType:(NOT \"4/A\") AND filedAt:${filedAt}`
            }
        },
        "from": "0",
        "size": "10",
        "sort": [
            {
                "filedAt": {
                    "order": "desc"
                }
            }
        ]
    }

}