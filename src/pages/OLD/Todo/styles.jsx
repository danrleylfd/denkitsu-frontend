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
  background-color: #7159C1;
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: .5rem;
  gap: .5rem;
  margin: 0 auto;
  width: 100%;
`

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.cardBg};
  padding: 1rem;
  border-radius: .5rem;
  min-width: 30%;
  width: 100%;
  max-width: 30%;
  height: min-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: ${({ isOver }) => (isOver ? 0.7 : 1)};

  h2 {
    margin-top: 0;
    color: ${({ theme }) => theme.color};
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
`

const TaskItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: .5rem;
  width: 100%;
  background-color: ${({theme}) => theme.cardBg};
  border: 1px solid ${({theme}) => theme.border};
  margin-bottom: 10px;
  cursor: grab;

  &:last-child {
    margin-bottom: 0;
  }
`

export {
  Container,
  ColumnContainer,
  TaskItemContainer
}
