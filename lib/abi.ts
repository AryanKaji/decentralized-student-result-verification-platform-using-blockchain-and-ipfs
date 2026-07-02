export const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "ipfsCid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "pdfHash",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "uploadedBy",
                "type": "address"
            }
        ],
        "name": "ResultStored",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            }
        ],
        "name": "getLatestResult",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getResultByIndex",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            }
        ],
        "name": "getResultCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "studentId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsCid",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "pdfHash",
                "type": "string"
            }
        ],
        "name": "storeResult",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
