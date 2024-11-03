const Button = ({ buttonText, buttonType = "primary", isDisabled = false, onClickHandle = () => {} }) => {
  const buttonStyle = {
    primary: 'border-[#7C36D6] bg-[#7C36D6] hover:bg-[hsl(266,66%,40%)] hover:border-[hsl(266,66%,40%)]',
    gray: 'border-[#45474E] bg-[#45474E] hover:bg-[hsl(227,6%,35%)] hover:border-[hsl(227,6%,35%)]',
  };

  return (
    <button
      className={`py-2 px-4 border-[1px] rounded-lg transition ${buttonStyle[buttonType]} ${isDisabled ? "opacity-50 pointer-events-none select-none" : ""}`}
      onClick={onClickHandle}
      disabled={isDisabled}>
      {buttonText}
    </button>
  );
};

export default Button;