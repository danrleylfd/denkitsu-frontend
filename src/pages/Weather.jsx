import { useState, useEffect, useCallback, useRef } from "react"
import { MdRefresh, MdSearch } from "react-icons/md"
import { LuSun, LuMoon } from "react-icons/lu"

import { useTheme } from "../contexts/ThemeContext"
import { getWeatherByLocation, getWeatherByCoordinates } from "../services/weather"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex justify-center items-center p-2 gap-2 min-h-screen w-full">{children}</main>

const Spinner = () => <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-base/20 border-t-primary-base dark:border-warning-light/20 dark:border-t-warning-light" />

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
        setError("Não foi possível encontrar o clima para esta cidade")
      }
    } finally {
      if (isMounted.current) setLoading(false)
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
          if (isMounted.current) setError("Erro ao obter clima pela sua localização")
        } finally {
          if (isMounted.current) setLoading(false)
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
    if (event.key === "Enter") buscarPorCidade()
  }

  useEffect(() => {
    buscarPorCoordenadas()
  }, [])

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <div className="relative w-full max-w-xl rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] bg-lightBg-primary p-4 opacity-75 dark:bg-darkBg-primary dark:opacity-90">
        <div className="flex items-center gap-2 pb-2">
          <Input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Buscar por cidade...">
            <Button variant="outline" size="icon" $rounded onClick={buscarPorCidade}>
              <MdSearch size={16} />
            </Button>
          </Input>
          <Button variant="outline" size="icon" $rounded onClick={buscarPorCoordenadas}>
            <MdRefresh size={16} />
          </Button>
          <Button variant={theme === "dark" ? "warning" : "outline"} size="icon" $rounded onClick={toggleTheme}>
            {theme === "dark" ? <LuSun size={16} /> : <LuMoon size={16} />}
          </Button>
        </div>

        {loading && (
          <div className="flex h-52 items-center justify-center">
            <Spinner />
          </div>
        )}

        {error && !loading && (
          <div className="flex h-52 items-center justify-center p-4 text-center text-danger-base dark:text-danger-light">
            {error}
          </div>
        )}

        {!loading && !error && weatherData && (
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col justify-between pb-2 md:pb-0 md:pr-2">
              <div>
                <div className="mb-2 text-2xl font-bold text-lightFg-primary opacity-90 dark:text-darkFg-primary">
                  {weatherData.name}, {weatherData.sys.country}
                </div>
                <div className="mb-2 text-lg capitalize text-lightFg-secondary dark:text-darkFg-secondary ">
                  {weatherData.weather[0].description}
                </div>
              </div>
              <div className="mb-2 text-5xl font-light leading-none text-warning-light dark:text-primary-base">
                {Math.round(weatherData.main.temp)}°C
              </div>
              <img className="h-28 w-28 -my-2 drop-shadow-[0_0_10px_rgba(130,87,229,0.3)] dark:drop-shadow-[0_0_10px_rgba(251,169,76,0.3)]" src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt={weatherData.weather[0].description} />
            </div>

            <div className="mt-2 flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">🌬️ Vento</span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary">{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">💧 Umidade</span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary">{weatherData.main.humidity}%</div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">🌡️ Sensação</span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary">{Math.round(weatherData.main.feels_like)}°C</div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">📊 Pressão</span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary">{weatherData.main.pressure} hPa</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideMenu>
  )
}

export default Weather
