const MainContainer = ({ children, className, ...props }) => {
  return (
    <div {...props} className={`flex flex-col p-2 gap-2 max-w-[1000px] ${className}`}>
      {children}
    </div>
  )
}

export default MainContainer
