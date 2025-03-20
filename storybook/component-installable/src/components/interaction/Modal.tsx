import React from 'react';

/**
 * 모달 속성
 */
export interface ModalProps {

  /**
   * 모달을 표시할지 여부
   */
  isOpen: boolean;

  /**
   * 모달을 표시할지 여부를 설정하는 함수
   */
  setIsOpen?: (isOpen: boolean) => void;

  /**
   * 모달을 닫을 때 호출되는 함수
   */
  onClose: () => void;

  /**
   * 모달 안에 표시할 내용
   */
  children?: React.ReactNode;
}

/**
 * 모달
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, onClose = null, children }) => {

  const closeHandler = () => {
    if (onClose) {
      onClose();
    }
    if (setIsOpen) {
      setIsOpen(false);
    }
  }

  return (
    <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    >
      {children}
      <button onClick={closeHandler}>Close</button>
    </div>
  )
};
