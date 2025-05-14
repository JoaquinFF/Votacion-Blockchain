import { ethers } from "hardhat";

async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`✅ Contrato Voting desplegado en: ${address}`);
}

main().catch((error) => {
  console.error("❌ Error al desplegar el contrato:");
  console.error(error);
  process.exitCode = 1;
});


