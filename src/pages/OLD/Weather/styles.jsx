import styled, { keyframes } from "styled-components"

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

export const Container = styled.div`
  background-color: ${({theme}) => theme.background};
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: .5em;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

  @media (max-width: 768px) {
    max-width: 450px;
  }
`

export const BuscaContainer = styled.div`
  display: flex;
  gap: .5rem;
  align-items: center;
  padding-bottom: .5rem;

  @media (max-width: 768px) {
    /* flex-direction: column; */
  }
`

export const ClimaInfoContainer = styled.div`
  display: flex;
  gap: .5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: .5rem;
  }
`

export const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: .5rem;
  border-right: 1px solid rgba(255,255,255,0.1);

  @media (max-width: 768px) {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: .5rem;
  }
`

export const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

export const CidadeNome = styled.div`
  font-size: 1.8rem;
  margin-bottom: .5rem;
  color: ${({theme}) => theme.textPrimary};
  opacity: 0.9;
`

export const Descricao = styled.div`
  font-size: 1.1rem;
  text-transform: capitalize;
  color: ${({theme}) => theme.textSecondary};
  margin-bottom: .5rem;
`

export const Temperatura = styled.div`
  color: ${({theme}) => theme.primaryBase};
  font-size: 3rem;
  font-weight: 300;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

export const IconeClima = styled.img`
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 0 10px rgba(233, 69, 96, 0.3));
  margin: -10px 0;
  /* align-self: center; */
`

export const DetalhesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .5rem;
  margin-top: .5rem;
`

export const DetalheItem = styled.div`
  background-color: ${({theme}) => theme.cardBg};
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(5px);

  span {
    display: block;
    font-size: 0.8rem;
    color: ${({theme}) => theme.textSecondary};
    margin-bottom: .5rem;
  }

  div {
    font-size: 1.2rem;
    font-weight: 500;
  }
`

export const AtualizarButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background-color: transparent;
  color: ${({theme}) => theme.primaryBase};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: ${({theme}) => theme.primaryLight};
    transform: rotate(180deg);
  }
  &:active {
    color: ${({theme}) => theme.primaryDark};
  }
`

export const CarregandoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; /* Ajuste conforme necessário */
`

const spinAnimation = keyframes`
  to { transform: rotate(360deg); }
`

export const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: ${({theme}) => theme.primaryBase};
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`

export const ErroMensagem = styled.div`
  text-align: center;
  color: ${({theme}) => theme.dangerBase};
  padding: 1rem;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`
