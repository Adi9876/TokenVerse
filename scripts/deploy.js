const hre = require("hardhat");

async function main() {
  const NFTMarket = await hre.ethers.deployContract("NFTMarket");
  await NFTMarket.waitForDeployment();
  const nftmarketaddress = NFTMarket.target;
  console.log("NFTMarketplace deployed to:", nftmarketaddress);

  const NFT = await hre.ethers.deployContract("NFT", [nftmarketaddress], {});
  await NFT.waitForDeployment();
  const nftaddress = NFT.target;
  console.log("NFT deployed to: ", nftaddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


