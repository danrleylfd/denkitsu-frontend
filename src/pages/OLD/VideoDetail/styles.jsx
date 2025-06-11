import styled from "styled-components"

export const SideContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: unset;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
  margin: 0 auto;
  height: 100vh;
  max-width: 67%;

  @media (max-width: 768px) {
    max-width: 89% !important;
    position: absolute;
    right: 0;
  }
`


const VideoPlayer = styled.video`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: .25rem;
`

const AuthorAvatar = styled.img`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
`

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: .5rem 0;
  gap: .5rem;
`

const InteractionContainer = styled(DetailContainer)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: .5rem 0;
  gap: .5rem;
`

export { VideoPlayer, DetailContainer, InteractionContainer, AuthorAvatar }
