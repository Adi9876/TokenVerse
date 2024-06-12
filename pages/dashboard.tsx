import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
require("dotenv").config();

import NFTabi from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarketplaceabi from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// matic
const nftMarketAddress = "";
const nftAddress = "";


export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      loadNFTs()
    }, [])
    async function loadNFTs() {
      try{// const web3Modal = new Web3Modal({
      //   network: 'mainnet',
      //   cacheProvider: true,
      // })
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect()
      const provider = new ethers.BrowserProvider(connection);

      // const provider = new ethers.JsonRpcProvider();
      console.log("yo",provider)
      const signer = await provider.getSigner()
  
      const contract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, signer)
      console.log("Inside dashboard: ",signer.getAddress());
      const data = await contract.fetchItemsListed()
      
      const items:any = await Promise.all(data.map(async (i:any) => {
        const tokenUri = await contract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        }
        return item
      }))
  
      setNfts(items)
      setLoadingState('loaded') }catch(error){
        console.log(error);
      }
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
    return (
      <div>
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft:any, i:any) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <div className="h-64 w-full p-2 overflow-hidden flex justify-center items-center">
                    <img src={nft.image} className="h-full w-full object-contain rounded" />
                    </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">Price - {nft.price} MAT</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }