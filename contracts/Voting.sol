// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool registered;
        bool hasVoted;
    }

    address public admin;
    mapping(address => Voter) public voters;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    bool public electionActive;

    constructor() {
        admin = msg.sender;
        electionActive = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Solo el admin puede realizar esta accion.");
        _;
    }

    modifier onlyWhenActive() {
        require(electionActive, "La votacion ha finalizado.");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function registerVoter(address _voter) public onlyAdmin {
        voters[_voter].registered = true;
    }

    function vote(uint _candidateId) public onlyWhenActive {
        require(voters[msg.sender].registered, "No estas registrado para votar.");
        require(!voters[msg.sender].hasVoted, "Ya has votado.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Candidato invalido.");

        voters[msg.sender].hasVoted = true;
        candidates[_candidateId].voteCount++;
    }

    function endElection() public onlyAdmin {
        electionActive = false;
    }

    function getCandidate(uint _id) public view returns (string memory, uint) {
        Candidate memory c = candidates[_id];
        return (c.name, c.voteCount);
    }
}
