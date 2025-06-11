const MainContainer = ({ children, style = {} }) => {
  return (
    <div
      className="flex flex-col p-2 gap-2 mx-auto max-w-[1000px]"
      style={style}
    >
      {children}
    </div>
  )
}

export default MainContainer
