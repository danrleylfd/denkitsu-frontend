import { Container } from "./styles"

const MainContainer = ({ children, style={} }) => {
  return (
    <Container style={style}>
      {children}
    </Container>
  )
}

export default MainContainer
