import { Link } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";

export const IndexPage = () => {
    return (
        <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            <Link to="PageUsingCss">Using css version button</Link>
            <br />
            <Link to="pageUsingStyled">Using styled-components button</Link>
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    )
};
