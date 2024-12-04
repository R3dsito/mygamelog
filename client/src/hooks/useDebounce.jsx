import { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
  const [deboundedValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return deboundedValue;
};

export default useDebounce;
