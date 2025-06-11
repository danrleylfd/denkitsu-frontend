import styled from "styled-components"

const VideoGrid = styled.div`
  /* display: flex; */
  /* flex-wrap: wrap; */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin: 0 auto;
  gap: .5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 412px) {
    grid-template-columns: 1fr;
  }
`

export { VideoGrid }
