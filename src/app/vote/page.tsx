import { Metadata } from "next";
import VoteClient from "./_components/VoteClient";

export const metadata: Metadata = {
  title: "Radiowęzeł ZSTiO - Głosowanie",
  description: "Zaproponuj piosenkę lub zagłosuj na propozycje innych!",
};

export default function VotePage() {
  return <VoteClient />;
}
