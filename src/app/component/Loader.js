import React from 'react';
import { Oval } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Oval
        visible={true}
        height={80}
        width={80}
        color="#4fa94d"
        ariaLabel="oval-loading"
        secondaryColor="#4fa94d"
        strokeWidth={4}
        strokeWidthSecondary={4}
      />
    </div>
  );
};

export default Loader;
