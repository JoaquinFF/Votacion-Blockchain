import { ethers } from "hardhat";

async function main() {
  // Obtener las cuentas de prueba
  const [admin, votante1, votante2] = await ethers.getSigners();
  
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`✅ Contrato Voting desplegado en: ${address}`);

  // Agregar candidatos automáticamente
  await voting.addCandidate("La Libertad Avanza");
  await voting.addCandidate("Unión por la Patria");
  console.log("✅ Candidatos agregados");

  // Registrar votantes de prueba
  await voting.registerVoter(votante1.address);
  await voting.registerVoter(votante2.address);
  console.log("✅ Votantes registrados:");
  console.log(`- Votante 1: ${votante1.address}`);
  console.log(`- Votante 2: ${votante2.address}`);
}

main().catch((error) => {
  console.error("❌ Error al desplegar el contrato:");
  console.error(error);
  process.exitCode = 1;
});


