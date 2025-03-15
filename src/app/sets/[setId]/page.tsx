"use client"; // Dit zorgt ervoor dat het een Client Component is

import { useParams } from "next/navigation";
import PokeDex from "@/app/pokedex/page";

export default function SetPage() {
  const params = useParams();

  if (!params.setId) return <p>Loading...</p>; 
  
  return <PokeDex setId={params.setId as string} />;
}
