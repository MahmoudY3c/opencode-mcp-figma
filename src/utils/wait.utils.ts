export const waitForValue = <T>(
  fn: () => T | undefined | null,
  interval = 1000,
): Promise<T> => {
  return new Promise((resolve) => {
    const check = () => {
      const value = fn();
      if (value) {
        resolve(value);
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
};
