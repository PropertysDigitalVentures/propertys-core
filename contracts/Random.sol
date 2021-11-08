//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract Random {
    uint256 public constant p = 4294967291;
    uint256 public cap = 6000;
    uint256 public seed;

    uint256[] public testArray = [1, 2, 3, 4, 5];

    constructor() {
        // seed = 123;
    }

    function getPRNG(uint256 x) public view returns (uint256) {
        if (x >= p) return x;
        uint256 r = (((x * x) % p));
        return (x <= p / 2) ? r % cap : (p - r) % cap;
    }

    function getMultiPRNG() public view returns (uint256[] memory) {
        uint256[] memory output = new uint256[](cap);

        for (uint256 i = 0; i < cap; i++) {
            output[i] = getPRNG(i);
        }
        return output;
    }

    function getTestArray() public view returns (uint256[] memory) {
        return testArray;
    }

    function popTestArray(uint256 index) public {
        require(index < testArray.length);
        testArray[index] = testArray[testArray.length - 1];
        testArray.pop();
    }

    function pushTestArray(uint256 value) public {
        testArray.push(value);
    }

    function pushMultipleTestArray(uint256[] memory values) public {
        for (uint256 i = 0; i < values.length; i++) {
            testArray.push(values[i]);
        }
    }
}
