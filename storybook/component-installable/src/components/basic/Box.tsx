import React from 'react';

interface BoxProperties extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 상자의 색상
   */
  backgroundColor?: string;

  /**
   * 상자 안에 표시할 내용
   */
  children?: React.ReactNode;
};

/**
 * 상자를 나타낸다.
 */
export const NewBox: React.FC<BoxProperties> = ({backgroundColor = 'white', children, ...props}) => {
  return (
    <div style={{
      backgroundColor,
      ...(props.style || {}),
    }}>
      {children}
    </div>
  );
};

/**
 * @deprecated
 */
NewBox.defaultProps = {
  backgroundColor: 'white',
};
