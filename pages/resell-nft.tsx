import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

import NFTMarketplaceabi from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// matic
const nftMarketAddress = "";
const nftAddress = "";


export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  console.log("router here",router)
  console.log("router qurery here :",router.query)
  const { id, tokenURI } = router.query;
  const { image, price } = formInput

  // useEffect(() => {
  //   // fetchNFT()
  // }, [id])

//   async function fetchNFT() {
//     if (!tokenURI) return
//     const meta = await axios.get(tokenURI)
//     updateFormInput(state => ({ ...state, image: meta.data.image }))
//   }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.BrowserProvider(connection)

    // const provider = new ethers.JsonRpcProvider();
    const signer = await provider.getSigner()

    const priceFormatted = ethers.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, signer)
    let listingPrice = await contract.getListPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
  )
}