const express = require('express');
const cors = require('cors');
const o1js = require('o1js');

const dotenv = require('./dotenv')

const oraclePrivateKey = o1js.PrivateKey.fromBase58(dotenv.DWELLIR_O1JS_PRIVATE_KEY);

// define a bytes32 class to wrap ethereum state with
class Bytes32 extends o1js.Bytes(32) {}

const app = express();
app.use(cors());
app.use(express.json());

app.listen(3000, () => {
    console.log('Listening on port 3000!');
});

/**
 * Given a block height parameter, access the ethereum state at that block and return an attestation to it
 * 
 * @returns the ethereum state root, block height, and a signature that can be verified on Mina
 */
app.get('/stateRoot/:blockHeight', async (req, res) => {
    const { blockHeight } = req.params;
    const blockHex = `0x${Number(blockHeight).toString(16)}`;

    const requestOptions = generateGetBlockByNumberRequest(blockHex);
    const url = dotenv.DWELLIR_API_HOST + dotenv.DWELLIR_API_KEY;

    /**
     * In this example we make a network request, but the same data could be accessed from a node running on the same server
     */
    const dwellirResponse = await (await fetch(url, requestOptions)).json();

    /**
     * We convert the state root from a hex string to a Mina native bytes32 representation
     */
    console.log(dwellirResponse.result.stateRoot);
    const stateRoot = Bytes32.fromHex(dwellirResponse.result.stateRoot.replace('0x', ''));
    console.log("0x" + stateRoot.toHex());

    /**
     * Create the plaintext that we are attesting to, namely
     * the block height and the state root of that block
     */
    const attestation = {
        blockHeight,
        stateRoot: "0x" + stateRoot.toHex()
    }

    /**
     * Convert the data that we need into Mina native Field values
     * then compute a signature on the data using Mina's native curves
     */
    const signature = o1js.Signature.create(oraclePrivateKey, [
        o1js.Field(blockHeight),
        ...stateRoot.toFields()
    ]).toJSON();

    /**
     * Return the plaintext and the signed attestation
     */
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify({
        attestation,
        signature
    }));
});

function generateGetBlockByNumberRequest(blockHex) {
    const requestData = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [blockHex, false],
        "id": 1
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    return {
        headers: myHeaders,
        method: "POST",
        body: JSON.stringify(requestData)
    }
}