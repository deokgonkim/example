import { Link, useLocation, useNavigate } from "react-router-dom";

import logo from './logo.svg';
import { useEffect, useState } from "react";

export const Home = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState("");

    const updateMessage = (event) => {
        setMessage(event.target.value);
    }

    const goAbout = () => {
        navigate('/about', { state: { message } });
    }

    useEffect(() => {
        console.log('home');
        console.log('message', message);
        console.log('location.state', location.state);
        setMessage(location.state?.message || "");
    }, [location.state?.message]);

    return (
        <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            <input value={message} onChange={updateMessage} />
          </p>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                {/* <Link to="/about">About</Link> */}
                <button onClick={() => goAbout()}>About</button>
              </li>
            </ul>
          </nav>
        </header>
        </div>
    );
}
