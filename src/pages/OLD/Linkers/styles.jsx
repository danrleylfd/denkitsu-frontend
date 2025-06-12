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
    max-width: 89%;
    position: absolute;
    right: 0;
  }
`

const FormSection = styled.section`
  background-color: ${({theme}) => theme.cardBg};
  padding: 1rem;
  border-radius: .5rem;
`

const FormControl = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`

const LinkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: .5rem;
  width: 100%;
  background-color: ${({theme}) => theme.cardBg};
  border: 1px solid ${({theme}) => theme.border};
`

const LinkDetails = styled.div`
  display: flex;
  gap: .5rem;
`

const LinkActions = styled.div`
  display: flex;
  gap: .5rem;
`

export {
  FormSection,
  FormControl,
  LinkItem,
  LinkDetails,
  LinkActions,
}
