import styled from "styled-components"

export const SideContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: .5rem;
  gap: .5rem;
  margin: 0 auto;
  height: 100vh;
  background-color: #7159C1;
`

const Container = styled.div`
  display: flex;
  width: max-content;
  height: max-content;
  margin: 10rem auto;
  padding: 1rem;
  gap: .5rem;
  align-items: center;

  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8rem .5rem .5rem 8rem;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.10);
`

const ProfileView = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .5rem;
`

const ProfileForm = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
`

const Avatar = styled.img`
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  object-fit: cover;

  border: .25rem solid ${({ theme }) => theme.primaryBase};
  box-shadow: 0 2px 16px 0 rgba(130,87,229,0.10);
`

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  gap: .5rem;
  justify-content: space-between;
`

export {
  Container,
  ProfileView,
  ProfileForm,
  Avatar,
  ButtonGroup
}
