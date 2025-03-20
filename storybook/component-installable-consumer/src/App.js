import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { IndexPage } from "./IndexPage";
import { PageUsingCss } from "./PageUsingCss";
import { PageUsingStyled } from "./PageUsingStyled";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="PageUsingCss" element={<PageUsingCss />} />
        <Route path="PageUsingStyled" element={<PageUsingStyled />} />
      </Routes>
    </Router>
  );
}

export default App;
