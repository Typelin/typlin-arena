import PaperGrain from "./components/PaperGrain";
import TopBar from "./components/TopBar";
import PressJourney from "./components/PressJourney";
import ProofPress from "./components/ProofPress";
import Judgment from "./components/Judgment";
import Finale from "./components/Finale";

export default function App() {
  return (
    <div className="app" id="top">
      <PaperGrain />
      <TopBar />
      <main>
        <PressJourney />
        <ProofPress />
        <Judgment />
        <Finale />
      </main>
    </div>
  );
}
