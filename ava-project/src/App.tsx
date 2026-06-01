import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import SpeechToTextPage from "../src/pages/SpeechToTextPage/SpeechToTextPage";
import ArchivePage from "./pages/ArchivePage/ArchivePage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout/>}>
        <Route path="/" element={<SpeechToTextPage />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Route>
    </Routes>
  );
}

export default App;
