import { useState, useEffect } from 'react';

const useContainerDimensions = (myRef, trigger) => {

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const getDimensions = () => ({
      width: (myRef.current && myRef.current.offsetWidth) || 0,
      height: (myRef.current && myRef.current.offsetHeight) || 0,
    });
    
    const handleResize = () => {
      setDimensions(getDimensions())
    };

    if (myRef) {
      setDimensions(getDimensions())
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize)
    };
  }, [myRef, trigger]);

  return dimensions;
};

export default useContainerDimensions;
