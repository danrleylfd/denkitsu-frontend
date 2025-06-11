import styled from "styled-components"

const Article = styled.article`
  max-width: 20rem;
  width: 100%;
  height: 100%;

  position: relative;
  display: block;

  overflow: hidden;
  border-radius: .5rem;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.4s ease-in-out;

  :hover img {
    transform: scale(1.5);
  }
`

const ArticleFigure = styled.figure`
  width: 100%;
  height: 14rem;

  overflow: hidden;
`

const ArticleImage = styled.img`
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;

  object-fit: cover;
  overflow: hidden;
  transform-origin: center;
  transition: transform .5s ease-in-out;
`

const ArticleVideo = styled.video`
  max-width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;

  object-fit: cover;
  overflow: hidden;
  transform-origin: center;
  transition: transform .5s ease-in-out;
`

const ArticlePreview = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: .5rem;

  background-color: ${({ theme }) => theme.cardBg};
  transition: background-color 0.3s ease-in-out;
`

export { Article, ArticlePreview, ArticleFigure, ArticleImage, ArticleVideo }
