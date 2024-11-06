// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp } from "./authService";

const ConfirmUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || "");
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await confirmSignUp(username, confirmationCode);
      alert("Account confirmed successfully!\nSign in on next page.");
      navigate("/login");
    } catch (error) {
      alert(`Failed to confirm account: ${error}`);
    }
  };

  return (
    <div className="loginForm">
      <h2>Confirm Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            className="inputText"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div>
          <input
            className="inputText"
            type="text"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder="Confirmation Code"
            required
          />
        </div>
        <button type="submit">Confirm Account</button>
      </form>
    </div>
  );
};

export default ConfirmUserPage;