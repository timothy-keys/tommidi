import { createFileRoute } from "@tanstack/react-router";
import { PianoVisualizer } from "../components/PianoVisualizer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <PianoVisualizer />;
}
