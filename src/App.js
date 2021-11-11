/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abiFile from "./utils/Handicapper.json";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Button,
  useColorMode,
  ColorModeProvider,
} from "@chakra-ui/react";
import { HandicapForm } from "./components/HandicapForm";

import { extendTheme } from "@chakra-ui/react";
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [scores, setScores] = useState([]);
  const [submitScoreData, setSubmitScoreData] = useState("");
  const contractAddress = "0xa5D5f34e17fed8D792999E170570aF03F9CC851B";
  const contractABI = abiFile.abi;

  const getAllScores = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const handicapContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let scores = await handicapContract.getAllScores();
        let cleanScores = [];
        scores.forEach((score) => {
          cleanScores.push({
            course: score.course,
            timestamp: new Date(score.timestamp * 1000),
            golfer: score.golfer,
            score: score.score.toNumber(),
            date: score.date,
            slope: score.slope.toNumber(),
            rating: score.rating.toNumber(),
          });
        });
        console.log(cleanScores.reverse());
        setScores(cleanScores.reverse());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let handicapContract;

    const onNewScore = (
      golfer,
      course,
      score,
      date,
      slope,
      rating,
      timestamp
    ) => {
      console.log("on new score", course);
      // fancy way to update state. access previous state without doing let newWaves = waves. Returns new state.
      setScores((prevState) => [
        ...prevState,
        {
          course: course,
          timestamp: new Date(timestamp.toNumber() * 1000),
          golfer: golfer,
          score: score.toNumber(),
          date: date,
          slope: slope.toNumber(),
          rating: rating.toNumber(),
        },
      ]);
    };

    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      handicapContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      handicapContract.on("NewScore", onNewScore);
    }

    // prevent mem leaks
    return () => {
      if (handicapContract) {
        handicapContract.off("NewScore", onNewScore);
      }
    };
  }, [contractABI]);

  const checkIfWalletIsConnected = async () => {
    console.log("check if wallet connected");

    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllScores();
      } else {
        alert("Please connect your metamask wallet.");
        console.log("No authorized account found");
      }
    } catch (error) {
      alert("Could not connect your metamask wallet, please try again.");
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const setData = (e) => {
    console.log(e.target.value);
  };

  const submitScore = async (data) => {
    if (!currentAccount) {
      alert("No account found, please connect your Metamask wallet.");
      return;
    }

    console.log("submit score", data);
    if (Object.keys(data).length === 0) {
      alert("Please fill out required fields.");
      return;
    }
    const { course, score, date, slope, rating } = data;

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const handicapContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */

        const waveTxn = await handicapContract.submitScore(
          course,
          score,
          date,
          slope,
          rating,
          { gasLimit: 300000 }
        );
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        getAllScores();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box height="100vh" bg="gray.800" py={6}>
        <Box width="500px" margin="0 auto" mt={8} border="1px solid #eee" borderRadius="5px" bg="white" p={6}>
          <Heading>Track Your Handicap</Heading>

          <Text my={2}>
            Submit your scores to the public blockchain to track your handicap.
            Keep everyone honest!
          </Text>

          {/*
           * If there is no currentAccount render this button
           */}
          {!currentAccount ? (
            <Box
              border="1px solid #eee"
              p={4}
              m={4}
              borderRadius="5px"
              fontSize="sm"
            >
              <Text mb={3}>First, connect your Metamask wallet.</Text>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
              <Text mt={3}>Then switch to the Rinkeby test newtork.</Text>
            </Box>
          ) : (
            <Text fontSize="xs" my={2} color="green.500">
              Wallet connected! Make sure you are on the Rinkeby test network.
            </Text>
          )}

          <HandicapForm onSubmit={submitScore} />

          <Heading mt={6}>Scores</Heading>

          {scores &&
            scores.map((score) => (
              <Box
                border="1px solid #eee"
                borderRadius="5px"
                my={2}
                key={score.timestamp.toString()}
                fontSize="sm"
                textAlign="left"
                overflow="hidden"
              >
                <Box px={4} py={2} bg="blue.800" color="gray.200">
                  <Text fontSize="sm" fontWeight="500" isTruncated>
                    Golfer: {score.golfer}
                  </Text>
                </Box>

                <Box display="flex" justifyContent="space-evenly" alignItems="end" mt={3}>
                  <Box mx={4} display="flex" alignItems="end">
                    <Heading size="4xl" color="blue.500">
                      {score.score}
                    </Heading>
                    <Text fontWeight="500" color="gray.600">
                      Course: {score.course}
                    </Text>
                  </Box>

                  <Box textAlign="center" fontSize="xs" color="gray.500">
                    <Text>Rating: {score.rating}</Text>
                    <Text>Slope: {score.slope}</Text>
                  </Box>
                </Box>
                <Box
                  px={4}
                  mt={4}
                  py={2}
                  bg="gray.50"
                  display="flex"
                  justifyContent="space-between"
                  color="gray.700"
                >
                  <Text fontSize="xs" isTruncated mt={1}>
                    {score.timestamp.toString()}
                  </Text>
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default App;
