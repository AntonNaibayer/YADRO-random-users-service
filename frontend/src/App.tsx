import { Route, Routes } from "react-router-dom";

import { PeoplePage } from "./pages/PeoplePage";
import { PersonDetailPage } from "./pages/PersonDetailPage";
import { RandomPersonPage } from "./pages/RandomPersonPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PeoplePage />} />
      <Route path="/people/:personId" element={<PersonDetailPage />} />
      <Route path="/random" element={<RandomPersonPage />} />
    </Routes>
  );
}

export default App;