import styled from 'styled-components';

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

  @media (max-width: 768px) {
    max-width: 89% !important;
    position: absolute;
    right: 0;
  }
`
