import { FiLogIn } from "react-icons/fi";

const ButtonWrapper = () => {
  return (
    <div className="flex min-h-[200px] items-center justify-center bg-neutral-900">
      <RoundedSlideButton />
    </div>
  );
};

const RoundedSlideButton = () => {
  const handleNavigation = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    window.location.href = "/auth";
  };

  return (
    <button
      onClick={handleNavigation}
      className={`
        relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px] 
        border-violet-300 px-4 py-2 font-semibold
        uppercase text-violet-300 transition-all duration-500
        
        before:absolute before:inset-0
        before:-z-10 before:translate-x-[150%]
        before:translate-y-[150%] before:scale-[2.5]
        before:rounded-[100%] before:bg-violet-300
        before:transition-transform before:duration-1000
        before:content-[""]
        hover:scale-105 hover:text-neutral-900
        hover:before:translate-x-[0%]
        hover:before:translate-y-[0%]
        active:scale-95`}
    >
      <FiLogIn />
      <span>Sign up free</span>
    </button>
  );
};

export default ButtonWrapper;