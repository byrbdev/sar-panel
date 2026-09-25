import React from "react";

function useOutsideAlerter(ref: any, setX: any): void {
  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    // function handleClickOutside(event: React.MouseEvent<HTMLElement>) {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setX(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setX]);
}

const Dropdown = (props: {
  button: JSX.Element;
  children: JSX.Element;
  classNames: string;
  animation?: string;
  /** Mode controlled (opsional): kalau diberikan, buka/tutup dropdown
   * dikendalikan dari komponen induk (mis. Navbar perlu menutup dropdown
   * notifikasi begitu salah satu notifikasi diklik supaya tidak "numpuk"
   * dengan modal detail yang muncul di atasnya). Kalau tidak diberikan,
   * perilakunya persis seperti sebelumnya (uncontrolled). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { button, children, classNames, animation, open, onOpenChange } =
    props;
  const wrapperRef = React.useRef(null);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const openWrapper = isControlled ? open : internalOpen;
  const setOpenWrapper = isControlled
    ? (v: boolean) => onOpenChange?.(v)
    : setInternalOpen;
  useOutsideAlerter(wrapperRef, setOpenWrapper);

  return (
    <div ref={wrapperRef} className="relative flex">
      <div className="flex" onMouseDown={() => setOpenWrapper(!openWrapper)}>
        {button}
      </div>
      <div
        className={`${classNames} absolute z-10 ${
          animation
            ? animation
            : "origin-top-right transition-all duration-300 ease-in-out"
        } ${openWrapper ? "scale-100" : "scale-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown;
