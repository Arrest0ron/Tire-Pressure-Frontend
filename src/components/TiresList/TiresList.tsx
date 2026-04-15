// src/components/TiresList/TiresList.tsx
import "./TiresList.css";
import TireCard from "../TireCard/TireCard";
import { type Tire } from "../../modules/tireApi";

export default function TiresList({ tires }: { tires: Tire[] }) {
  return (
    <div className="container">
      {tires.map((tire) => (
        <TireCard key={tire.tire_id} tire={tire} />
      ))}
    </div>
  );
}