import React, { forwardRef, useImperativeHandle, useRef } from "react";

let t1 = null;
const Toast = forwardRef(function Toast(props, ref) {
  const { children } = props;
  const toastRef = useRef(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        raise() {
          clearInterval(t1);
          slideIn();
          t1 = setTimeout(slideOut, 5000);
        },
      };
    },

    []
  );

  function slideIn() {
    toastRef.current.style.top = 0;
  }

  function slideOut() {
    toastRef.current.style.top = "-100%";
  }

  return (
    <div
      ref={toastRef}
      className="toast-container absolute left-0 -top-20 flex justify-center items-center w-full duration-100 ease-out"
    >
      <div className="bg-white p-4 transition">
        {children || "Toast content"}
      </div>
    </div>
  );
});

export default Toast;
