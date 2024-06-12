import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import toast, { Toaster } from "react-hot-toast";
import hre from "hardhat";

// import NFTabi from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarketplaceabi from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// const nftMarketAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// matic

const nftMarketAddress = "";
const nftAddress = "";

export default function Home() {

  interface NFTItem {
    price: string;
    tokenId: number;
    seller: string;
    owner: string;
    image: string;
    name: string;
    description: string;
  }

  const [nfts, setNft] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState("not-loaded");

  useEffect(() => {

    loadNFT();
  }, []);



  async function loadNFT() {
    try {// console.log(ethers);
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.BrowserProvider(connection)

      // const provider = new ethers.JsonRpcProvider();
      // const provider:any = hre.network.provider();
      const contract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, provider)
      // console.log(contract.name());
      const data = await contract.fetchMarketItems();

      const items = await Promise.all(data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return item
      }))
      setNft(items);
      setLoading('loaded');
    } catch (error) {
      console.log(error);
      toast.error("Error Occured");
    }
  }


  async function buyNft(n: any) {

    try {
      // console.log(n);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect()
      const provider = new ethers.BrowserProvider(connection);

      // const provider = await new ethers.JsonRpcProvider()

      const signer = await provider.getSigner()

      console.log("when buy: ", signer.getAddress());

      const contract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, signer)

      const price = ethers.parseUnits(n.price.toString(), 'ether')
      console.log(price);
      const transaction = await contract.createMarketSale(n.tokenId, {
        value: price
      })
      await transaction.wait();
      loadNFT()
    } catch (error) {
      console.log(error);
      toast.error("An unknown error occured");
    }
  }

  if (loading === "loaded" && !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl">No items in market place</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1200px' }}>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">

          {
            nfts.map((nft, i) => (
              <div key={i} className="p-2 border shadow rounded-xl overflow-hidden">
                <div className="h-60 w-full overflow-hidden flex justify-center items-center">
                  <img src={nft.image} className="h-full w-full object-contain" />
                </div>
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold h-16">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }} className="h-20 overflow-hidden">
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} MAT</p>
                  <button className="mt-4 w-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
                <Toaster position="top-right" />
              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}
