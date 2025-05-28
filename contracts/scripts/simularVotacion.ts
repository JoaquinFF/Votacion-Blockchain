import { ethers } from "hardhat";
import type { Voting } from "../typechain-types";

async function main() {
  // Obtener cuentas locales de Hardhat
  const [admin, votante1, votante2] = await ethers.getSigners();

  // Dirección del contrato desplegado
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Obtener instancia del contrato
  const Voting = await ethers.getContractAt("Voting", contractAddress) as Voting;

  // Agregar candidatos desde cuenta admin
  await Voting.connect(admin).addCandidate("Candidato A");
  await Voting.connect(admin).addCandidate("Candidato B");
  console.log("✅ Candidatos agregados");

  // Registrar votantes
  await Voting.connect(admin).registerVoter(votante1.address);
  await Voting.connect(admin).registerVoter(votante2.address);
  console.log("✅ Votantes registrados");

  // Votar desde distintas cuentas
  await Voting.connect(votante1).vote(1);
  console.log("🗳️ Votante 1 votó al candidato 1");

  await Voting.connect(votante2).vote(2);
  console.log("🗳️ Votante 2 votó al candidato 2");

  // Leer resultados
  const c1 = await Voting.getCandidate(1);
  const c2 = await Voting.getCandidate(2);

  console.log("📊 Resultados:");
  console.log(`Candidato 1 (${c1[0]}): ${c1[1]} votos`);
  console.log(`Candidato 2 (${c2[0]}): ${c2[1]} votos`);
}

main().catch((error) => {
  console.error("❌ Error en la simulación:");
  console.error(error);
  process.exitCode = 1;
});
