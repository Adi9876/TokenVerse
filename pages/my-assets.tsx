import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import Web3Modal from "web3modal";
import NFTMarketplaceabi from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// const nftMarketAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// matic
const nftMarketAddress = "";
const nftAddress = "";

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    try{
      const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.BrowserProvider(connection)
    
    // const provider = new ethers.JsonRpcProvider();
    
    const signer = await provider.getSigner()
    
    const marketplaceContract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, signer)
    
    const data = await marketplaceContract.fetchMyNFTs();
    console.log("data >>>> ",data);

    const items:any = await Promise.all(data.map(async (i:any) => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      console.log(meta);
      let price = ethers.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))
    console.log(items);
    setNfts(items)
    setLoadingState('loaded')
  }catch(error){
      console.log(error)
    }
  }
  
  function listNFT(nft:any) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft:any, i:any) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
                  <button className="mt-4 w-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
