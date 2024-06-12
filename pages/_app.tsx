import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect, Suspense } from "react";
import { ethers } from "ethers";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import Web3Modal from "web3modal";


export default function App({ Component, pageProps }: AppProps) {

  let [connected, setConnected] = useState(false);
  let [walletAddress, setWalletAddress] = useState("");
  let [change, setchange] = useState(0);

  useEffect(() => {

    const { ethereum } = window;
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    connectWallet(window);

  }, [change]);

  async function connectWallet(window: any) {
    const { ethereum } = window;
    if (!connected) {

      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.BrowserProvider(connection)

      // const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      if (walletAddress != " ") {
        setConnected(true);
        setWalletAddress(walletAddress);
        console.log(walletAddress);
      }

    } else {

      setConnected(false);
      setWalletAddress("");
      // console.log(ethereum);
    }
  };
  const revoke = () => {
    if (walletAddress == "") {
      change += 1;
      setchange(change);
    } else {
      setConnected(false);
      setWalletAddress("");
    }

  }


  return (<div className="animated-background min-h-screen flex flex-col">
    <div >
      <nav className="border-b p-6 bg-opacity-75 bg-gray-900">
        <div className="flex justify-center">
          <p className="text-4xl font-bold text-5xl glowing-text">
            NFTVerse
          </p>
        </div>

        <div className="flex mt-4 justify-between text-lg ">
          <div className="flex m-4">
            <Link legacyBehavior href="/">
              <a className="mr-4 text-purple-400 shadow-xl hover:text-white transition duration-300 hover:shadow-indigo-700/40  ">
                Home
              </a>
            </Link>
            <Link legacyBehavior href="/create-item">
              <a className="mr-4 text-purple-400 shadow-xl  hover:shadow-indigo-700/40 ">
                Sell NFT
              </a>
            </Link>
            <Link legacyBehavior href="/my-assets">
              <a className="mr-4 text-purple-400 shadow-xl  hover:shadow-indigo-700/40">
                My NFTs
              </a>
            </Link>
            <Link legacyBehavior href="/dashboard">
              <a className="mr-4 text-purple-400 shadow-xl  hover:shadow-indigo-700/40">
                Dashboard
              </a>
            </Link>
            {/* <Link legacyBehavior href="/resell-nft">
              <a className="mr-4 text-purple-400 shadow-xl  hover:shadow-indigo-700/40">
                Re-Sell
              </a>
            </Link> */}
          </div>
          <div className="flex items-center">
            <button onClick={revoke} className="p-1.5 rounded-xl transition ease-in-out delay-150 bg-gradient-to-r from-blue-500 to-purple-500 hover:-translate-y-1 hover:scale-101 text-white shadow-lg ">
              {connected ? walletAddress : "Connect"}
            </button>
          </div>
        </div>

      </nav>
    </div>

    <Component {...pageProps} />
  </div>);
}
