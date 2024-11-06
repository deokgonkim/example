// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { oauth2Token, signIn, signUp } from "./authService";

const ReturnPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('code')) {
      const code = searchParams.get('code');
      console.log("Code: ", code);
      oauth2Token(code).then((response) => {
        // navigate("/home");
        document.location.href = "/home";
      });
    }
  }, []);
  
  return (
    <h1>return</h1>
  );
};

export default ReturnPage;