/* eslint-disable @typescript-eslint/no-unsafe-call */
// have a function to enter the lottery
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddresses } from "../../constants";
import { useEffect, useState } from "react";
import {
  type BigNumberish,
  type ContractTransactionResponse,
  ethers,
} from "ethers";
import { useNotification } from "web3uikit";

type contractAddressesInterface = Record<string, string[]>;

export default function LotteryEntrance() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId: string = parseInt(chainIdHex!).toString();
  const raffleAddress = chainId in addresses ? addresses[chainId]![0] : "";
  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress, // specify the networkId
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress, // specify the networkId
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress, // specify the networkId
    functionName: "getNumOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress, // specify the networkId
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    const entranceFeeFromCall = (
      (await getEntranceFee()) as BigNumberish
    )?.toString();
    const numPlayersFromCall = (
      (await getNumOfPlayers()) as BigNumberish
    )?.toString();
    const recentWinnerFromCall = (await getRecentWinner()) as string;
    setEntranceFee(entranceFeeFromCall);
    setNumPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      // try to read the raffle entrance fee
      void updateUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx: ContractTransactionResponse) {
    await tx.wait(1);
    handleNewNotification();
    void updateUI();
  };

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5 font-mono text-white">
      <div className="mb-6">
        {!raffleAddress && (
          <>
            <div className="rounded-2xl bg-white bg-opacity-20 p-4 shadow-lg ">
              <div className="text-center text-lg">
                No Raffle Address detected!
              </div>
              <div className="text-center text-lg">
                Please connect with a cryptocurrency wallet{" "}
              </div>
              <div className="text-center text-lg">
                {" "}
                (e.g.: Metamask) to the Sepolia testnetwork
              </div>
            </div>
          </>
        )}
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white bg-opacity-20 p-4 shadow-lg">
          <div>
            <div className="text-start">
              Entrance Fee: {ethers.formatUnits(entranceFee, "ether")} ETH
            </div>
            <div className="text-start">Number Of Players: {numPlayers}</div>
          </div>
          <button
            className={`${
              isLoading || isFetching || !isWeb3Enabled || !raffleAddress
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-800"
            } transform rounded-xl px-4 py-2 font-bold text-white transition duration-150 ease-in-out ${
              !(isLoading || isFetching || !isWeb3Enabled || !raffleAddress)
                ? "hover:scale-105"
                : ""
            }`}
            onClick={async function () {
              await enterRaffle({
                onSuccess: (tx) => {
                  void handleSuccess(tx as ContractTransactionResponse);
                  return void 0;
                },
              });
            }}
            disabled={
              isLoading || isFetching || !isWeb3Enabled || !raffleAddress
            }
          >
            {isLoading || isFetching ? (
              <div className="spinner-border h-8 w-8 animate-spin rounded-full border-b-2"></div>
            ) : (
              "Enter Raffle"
            )}
          </button>
        </div>

        <div className="rounded-2xl bg-white bg-opacity-20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-start">Recent Winner: </span>
            <span className="text-end">{recentWinner}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-start">Contract Address: </span>
            <span className="text-end">{raffleAddress}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <a
          href="https://github.com/0xApplePie/smartcontract-lottery-frontend"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 transition duration-150 ease-in-out hover:text-blue-700"
        >
          made by 0xApplepie - GitHub
        </a>
      </div>
    </div>
  );
}
