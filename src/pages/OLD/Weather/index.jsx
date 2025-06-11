import { useState, useEffect, useCallback, useRef } from "react"
import { MdRefresh, MdSearch } from "react-icons/md"
import { LuSun, LuMoon } from "react-icons/lu"

import { useTheme } from "../../contexts/ThemeContext"
import { getWeatherByLocation, getWeatherByCoordinates } from "../../services/weather"

import SideMenu from "../../components/SideMenu"
import Input from "../../components/Input"
import Button from "../../components/Button"

import {
  SideContentContainer,
  Container,
  BuscaContainer,
  ClimaInfoContainer,
  LeftPanel,
  RightPanel,
  CidadeNome,
  Descricao,
  Temperatura,
  IconeClima,
  DetalhesGrid,
  DetalheItem,
  CarregandoContainer,
  Spinner,
  ErroMensagem
} from "./styles"


const Weather = () => {
  const { theme, toggleTheme } = useTheme()
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cityInput, setCityInput] = useState("")
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const buscarPorCidade = useCallback(async () => {
    if (!cityInput.trim() || !isMounted.current) return

    setLoading(true)
    setError(null)

    try {
      const data = await getWeatherByLocation(cityInput.trim())
      if (isMounted.current) {
        setWeatherData(data)
        setError(null)
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erro ao buscar dados do clima:", err)
        setError("Não foi possível encontrar o clima para esta cidade")
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [cityInput])

  const buscarPorCoordenadas = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo seu navegador")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const data = await getWeatherByCoordinates(latitude, longitude)

          if (isMounted.current) {
            setWeatherData(data)
            setError(null)
          }
        } catch (err) {
          if (isMounted.current) {
            console.error("Erro ao buscar dados do clima:", err)
            setError("Erro ao obter clima pela sua localização")
          }
        } finally {
          if (isMounted.current) {
            setLoading(false)
          }
        }
      },
      (err) => {
        if (isMounted.current) {
          setError("Permissão de localização negada ou erro ao obter localização")
          setLoading(false)
        }
      }
    )
  }, [])

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      buscarPorCidade()
    }
  }

  useEffect(() => {
    buscarPorCoordenadas()
  }, [])

  return (
    <SideMenu ContentView={SideContentContainer}>
      <Container>
        <BuscaContainer>
          <Input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Buscar por cidade...">
            <Button variant="outline" size="icon" $rounded onClick={buscarPorCidade}>
              <MdSearch size={16} />
            </Button>
          </Input>
          <Button variant="outline" size="icon" $rounded onClick={buscarPorCoordenadas}>
            <MdRefresh size={16} />
          </Button>
          <Button variant={theme == "light" ? "warning" : "outline"} size="icon" $rounded onClick={toggleTheme}>
            {theme === "light" ? <LuSun size={16} /> : <LuMoon size={16} />}
          </Button>
        </BuscaContainer>
        {loading && (
          <CarregandoContainer>
            <Spinner />
          </CarregandoContainer>
        )}
        {error && !loading && <ErroMensagem>{error}</ErroMensagem>}
        {!loading && !error && weatherData && (
          <ClimaInfoContainer>
            <LeftPanel>
              <div>
                <CidadeNome>
                  {weatherData.name}, {weatherData.sys.country}
                </CidadeNome>
                <Descricao>{weatherData.weather[0].description}</Descricao>
              </div>
              <Temperatura>{Math.round(weatherData.main.temp)}°C</Temperatura>
              <IconeClima src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt={weatherData.weather[0].description} />
            </LeftPanel>
            <RightPanel>
              <DetalhesGrid>
                <DetalheItem>
                  <span>🌬️ Vento</span>
                  <div>{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
                </DetalheItem>
                <DetalheItem>
                  <span>💧 Umidade</span>
                  <div>{weatherData.main.humidity}%</div>
                </DetalheItem>
                <DetalheItem>
                  <span>🌡️ Sensação</span>
                  <div>{Math.round(weatherData.main.feels_like)}°C</div>
                </DetalheItem>
                <DetalheItem>
                  <span>📊 Pressão</span>
                  <div>{weatherData.main.pressure} hPa</div>
                </DetalheItem>
              </DetalhesGrid>
            </RightPanel>
          </ClimaInfoContainer>
        )}
      </Container>
    </SideMenu>
  )
}

export default Weather
