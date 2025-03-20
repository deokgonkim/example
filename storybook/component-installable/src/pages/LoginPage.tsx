import React from "react";
import { NewBox } from "../components/basic/Box"
import { Button } from "../components";

export interface LoginPageProps {
  /**
   * 로그인 버튼을 눌렀을 때 호출되는 함수
   */
  onLogin: () => void;
}

/**
 * 로그인 페이지
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, ...props }) => {
  
  return (
    <NewBox backgroundColor="lightgrey">
      <h1>Login</h1>
      <form>
        <label>
          Username:
          <input type="text" />
        </label>
        <br />
        <label>
          Password:
          <input type="password" />
        </label>
        <br />
        <Button label="Log in" onClick={onLogin} />
      </form>
    </NewBox>
  )
}
