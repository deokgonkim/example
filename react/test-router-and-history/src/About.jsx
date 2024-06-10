import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export const About = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState("");

    useEffect(() => {
        console.log('about');
        console.log('location.state', location.state);
        setMessage(location.state?.message || "");
    }, [location.state?.message]);

    return (
        <div>
        <h2>About</h2>
        <p>{message}</p>
        <button onClick={() => navigate('/')}>Home</button>
        </div>
    );
}
