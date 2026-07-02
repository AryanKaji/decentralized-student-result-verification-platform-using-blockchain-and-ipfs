// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentResult {
    struct Result {
        string studentId;
        string ipfsCid;
        string pdfHash;
        uint256 timestamp;
        address uploadedBy;
    }

    mapping(string => Result[]) private results;

    event ResultStored(
        string studentId,
        string ipfsCid,
        string pdfHash,
        uint256 timestamp,
        address uploadedBy
    );

    function storeResult(
        string memory studentId,
        string memory ipfsCid,
        string memory pdfHash
    ) public {
        results[studentId].push(
            Result({
                studentId: studentId,
                ipfsCid: ipfsCid,
                pdfHash: pdfHash,
                timestamp: block.timestamp,
                uploadedBy: msg.sender
            })
        );

        emit ResultStored(
            studentId,
            ipfsCid,
            pdfHash,
            block.timestamp,
            msg.sender
        );
    }

    function getLatestResult(
        string memory studentId
    ) public view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ) {
        require(
            results[studentId].length > 0,
            "Result not found"
        );

        uint256 last = results[studentId].length - 1;

        Result memory r = results[studentId][last];

        return (
            r.studentId,
            r.ipfsCid,
            r.pdfHash,
            r.timestamp,
            r.uploadedBy
        );
    }

    function getResultCount(
        string memory studentId
    ) public view returns (uint256)
    {
        return results[studentId].length;
    }

    function getResultByIndex(
        string memory studentId,
        uint256 index
    ) public view returns(
        string memory,
        string memory,
        string memory,
        uint256,
        address
    ){
        require(
            index < results[studentId].length,
            "Invalid index"
        );

        Result memory r = results[studentId][index];

        return (
            r.studentId,
            r.ipfsCid,
            r.pdfHash,
            r.timestamp,
            r.uploadedBy
        );
    }
}
