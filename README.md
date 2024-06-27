# Dwellir Node Example

This is a bare-bones API for attested Ethereum state using the Dwellir API.  It exposes one endpoint, `/stateRoot/:blockHeight`, which accepts an integer block height, and returns an attestation of the ethereum state at that block height.

## How to run

To run this example locally, you will need a development environment with node installed.

#### Install the dependencies

`npm install`

`npm install -g nodemon`

#### Add Dwellir API key to the dotenv

Rename the file `dontenv.js.example` to `dotenv.js` and set a valid dwellir API key to run this example

#### Run the server

`nodemon index.js`

#### Interacting with the server

In a browser, navigate to http://localhost:3000/stateRoot/1000

You should see the response:

```
{
    "attestation": {
        "blockHeight": "1000",
        "stateRoot": "0x97fb274dbf35776cf0837c76438bb0804ea7b6152da3c8b53c663caf00e17be5"
    },
    "signature": {
        "r": "21787630312804855488719260188215099549878202880423205322836076898057405231487",
        "s": "12811630478487908511118165357571764934046071598839885359054784769319556656763"
    }
}
```

Congratulations, the example is running!