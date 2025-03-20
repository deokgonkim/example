import { StyledButton as Button } from "@deokgonkim/example-component-installable";
import { Link } from "react-router-dom";

export const PageUsingStyled = () => {
    return (
        <div className="page">
        <h1 className="header">Hello, world!</h1>
        <p className="content"><Button primary label="This is Button" onClick={() => {
            alert('Button clicked');
        }} /></p>
        <Link to="/">Back to home</Link>
        </div>
    );
};
