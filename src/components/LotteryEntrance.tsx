/* eslint-disable @typescript-eslint/no-unsafe-call */
// have a function to enter the lottery
import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../../constants"
import { useEffect, useState } from "react"
import { type BigNumberish, type ContractTransaction, type ContractTransactionResponse, ethers } from "ethers"
import { useNotification } from "web3uikit"

type contractAddressesInterface = Record<string, string[]>;

export default function LotteryEntrance() {
    const addresses: contractAddressesInterface = contractAddresses
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId: string = parseInt(chainIdHex).toString()
    const raffleAddress = chainId in addresses ? addresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dispatch = useNotification()

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
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getNumOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = ((await getEntranceFee()) as BigNumberish)?.toString()
        const numPlayersFromCall = ((await getNumOfPlayers()) as BigNumberish)?.toString()
        const recentWinnerFromCall = (await getRecentWinner()) as string
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            // try to read the raffle entrance fee
            void updateUI()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx: ContractTransactionResponse) {
        await tx.wait(1)
        handleNewNotification()
        void updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
       <div className="p-5 font-mono text-white">
    {raffleAddress ? (
        <div className="space-y-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-2xl shadow-lg flex items-center justify-between">
                <div>
                    <div className="text-start">Entrance Fee: {ethers.formatUnits(entranceFee, "ether")} ETH</div>
                    <div className="text-start">Number Of Players: {numPlayers}</div>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-xl transition duration-150 ease-in-out transform hover:scale-105"
                    onClick={async function () {
                        await enterRaffle({
                            onSuccess: (tx) => {
                                void handleSuccess(tx as ContractTransactionResponse);
                                return void 0;
                            },
                        });
                    }}
                    disabled={isLoading || isFetching}
                >
                    {isLoading || isFetching ? (
                        <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                    ) : (
                        "Enter Raffle"
                    )}
                </button>
            </div>

            <div className="bg-white bg-opacity-20 p-4 rounded-2xl shadow-lg">
    <div className="flex justify-between items-center">
        <span className="text-start">Recent Winner:  </span>
        <span className="text-end">{recentWinner}</span>
    </div>
    <div className="flex justify-between items-center mt-2">
        <span className="text-start">Contract Address:  </span>
        <span className="text-end">{raffleAddress}</span>
    </div>
</div>
        </div>
    ) : (
        <div className="text-center text-lg">No Raffle Address Detected</div>
    )}
<div className="mt-4 text-center" >
    <a href="https://github.com/0xApplepie" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out">
        made by 0xApplepie - GitHub 
    </a>
</div>
</div>
    )   
}
