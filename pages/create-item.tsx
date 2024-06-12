
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from "next/router";
import axios from "axios";
import Web3Modal from "web3modal";
import { Suspense } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";


import NFTabi from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarketplaceabi from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { getURL } from "next/dist/shared/lib/utils";

const projectId = process.env.PINATA_API_KEY;
const projectSecret = process.env.PINATA_SECRET;




// const auth =
//     'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// const client = ipfsHttpClient({
//     host: 'api.pinata.cloud',
//     port: 443,
//     protocol: 'https',
//     headers: {
//         authorization: auth,
//     },
// });

// const nftMarketAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// matic
const nftMarketAddress = "";
const nftAddress = "";

const notify = () => toast.success("NFT Generated...");

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()


    async function uploadToIPFS() {
        // { onChange }
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return

        console.log("fileUrl here", fileUrl);

        const data = { name: name, description: description, image: fileUrl }
        // {
        //     pinataMetadata: {
        //         name: 'marketPlace-'+ new Date().toLocaleString()
        //     },
        //     pinataContent: {
        //         name:name, description:description, image: fileUrl
        //     }

        // }

        console.log("data in uploadtoIPFs here :", data);

        try {
            const added = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: data,
                headers: {
                    pinata_api_key: `7d7b1605af6b276d3f35`,
                    pinata_secret_api_key: `01c7171d1557ac796b301c5e7258a3e5478aa064a0bfa03b3de8f06826d6439a`,
                    "Content-Type": "application/json"
                }
            });
            const url: any = `https://gateway.pinata.cloud/ipfs/${added.data.IpfsHash}`;
            console.log("url from uploadToIPFS: ", url);
            return url;

        } catch (error) {
            console.log("error in Uploadtoipfs: ", error);
        }


    }

    async function listNFTForSale() {

        try {

            const url = await uploadToIPFS()
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.BrowserProvider(connection)

            // const provider = new ethers.JsonRpcProvider();
            const signer = await provider.getSigner()

            const price = ethers.parseUnits(formInput.price, 'ether')
            let contract = new ethers.Contract(nftMarketAddress, NFTMarketplaceabi.abi, signer)
            console.log(contract);
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            let transaction = await contract.createToken(url, price, { value: listingPrice })
            // let transaction = await contract.createToken(url, price)
            toast.success('NFT created successfully!');
            await transaction.wait()
            router.push('/')
        }
        catch (error) {
            console.log("Error in listnftforsale: ", error);
        }
    }

    async function onChange(e: any) {
        const { ethereum } = window;
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append("file", file);
        // load = toast.success('Image Uploaded');

        if (file) {
            setLoading(true);
            try {

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `7d7b1605af6b276d3f35`,
                        pinata_secret_api_key: `01c7171d1557ac796b301c5e7258a3e5478aa064a0bfa03b3de8f06826d6439a`,
                    },
                });

                const url: string = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                console.log(url);
                setFileUrl(url);
                setLoading(false);

            } catch (error) {
                console.log("Error in onChange>> ", error);
            }
        }
    }

    // const call = ()=>{
    //     listNFTForSale();
    //     notify();
    // }


    return (
        <div className="flex justify-center">
            <div className="w-1/3 flex flex-col p-12 text-gray-700">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4 "
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Matic"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                {!fileUrl && !loading ? 
                
                    <label className="block w-full mt-4 p-4 border-4 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-500">
                        <input
                            type="file"
                            name="Asset"
                            className="hidden"
                            onChange={onChange}
                        />
                        <span className="text-gray-200">Click to upload or drag and drop</span>
                    </label>

                    : loading ? (
                        <div className="flex justify-center items-center mt-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                            <p className="ml-2 text-gray-200">Your Image ...</p>
                        </div>
                    ) :
                        <>
                        <Toaster position="top-right"/>
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                        </>
                }
                <button onClick={listNFTForSale} className="font-bold mt-4 bg-gradient-to-tr from-purple-500 to-blue-500 text-white rounded-3xl p-4 shadow-lg">
                    Create NFT
                </button>


            </div>
        </div>
    )
}