import { useState, useEffect, useCallback, useRef } from "react"
import { MdRefresh, MdSearch } from "react-icons/md"

import { getWeatherByLocation, getWeatherByCoordinates } from "../services/weather"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 min-h-screen w-full" data-oid="uzcouwo">
    {children}
  </main>
)

const Spinner = () => (
  <div
    className="h-12 w-12 animate-spin rounded-full border-4 border-primary-base/20 border-t-primary-base dark:border-warning-light/20 dark:border-t-warning-light"
    data-oid="9oc_j_."
  />
)

const Weather = () => {
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
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="tcer7hf">
      <div
        className="relative w-full max-w-xl rounded-lg shadow-[6px_6px_16px_rgba(0,0,0,0.5)] bg-lightBg-primary p-4 opacity-75 dark:bg-darkBg-primary dark:opacity-90"
        data-oid="cwuqfp5">
        {/* <div className="flex items-center gap-2 pb-2"> */}
        <Input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Buscar por cidade..."
          data-oid="h7_3pn.">
          <Button variant="outline" size="icon" $rounded onClick={buscarPorCidade} data-oid=".6igpsu">
            <MdSearch size={16} data-oid="wyhcii7" />
          </Button>
          <Button variant="outline" size="icon" $rounded onClick={buscarPorCoordenadas} data-oid="9ysk.eg">
            <MdRefresh size={16} data-oid="m2ofnl6" />
          </Button>
        </Input>
        {/* </div> */}

        {loading && (
          <div className="flex h-52 items-center justify-center" data-oid="qjhwt1v">
            <Spinner data-oid="n0slz2c" />
          </div>
        )}

        {error && !loading && (
          <div className="flex h-52 items-center justify-center p-4 text-center text-danger-base dark:text-danger-light" data-oid="h2fqtcq">
            {error}
          </div>
        )}

        {!loading && !error && weatherData && (
          <div className="flex flex-col gap-2 md:flex-row" data-oid="wo3y3xn">
            <div className="flex flex-1 flex-col justify-between pb-2 md:pb-0 md:pr-2" data-oid="d6._h-i">
              <div data-oid="lsz57eb">
                <div className="mb-2 text-2xl font-bold text-lightFg-primary opacity-90 dark:text-darkFg-primary" data-oid="nchaqtk">
                  {weatherData.name}, {weatherData.sys.country}
                </div>
                <div className="mb-2 text-lg capitalize text-lightFg-secondary dark:text-darkFg-secondary " data-oid="z30kmzt">
                  {weatherData.weather[0].description}
                </div>
              </div>
              <div className="mb-2 text-5xl font-light leading-none text-warning-light dark:text-primary-base" data-oid="ujsag5_">
                {Math.round(weatherData.main.temp)}°C
              </div>
              <img
                className="h-28 w-28 -my-2 drop-shadow-[0_0_10px_rgba(130,87,229,0.3)] dark:drop-shadow-[0_0_10px_rgba(251,169,76,0.3)]"
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                alt={weatherData.weather[0].description}
                data-oid="gh0urum"
              />
            </div>

            <div className="mt-2 flex-1" data-oid="spfcg-i">
              <div className="grid grid-cols-2 gap-2" data-oid="pwo4nau">
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary" data-oid="fuwo4hu">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="-jvy1cy">
                    🌬️ Vento
                  </span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary" data-oid="bzl5re:">
                    {Math.round(weatherData.wind.speed * 3.6)} km/h
                  </div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary" data-oid="zooq2nn">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="trh50w.">
                    💧 Umidade
                  </span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary" data-oid="sar_.cq">
                    {weatherData.main.humidity}%
                  </div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary" data-oid="ll-:t4w">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="pvyc08s">
                    🌡️ Sensação
                  </span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary" data-oid="ochqd5.">
                    {Math.round(weatherData.main.feels_like)}°C
                  </div>
                </div>
                <div className="rounded-xl bg-lightBg-secondary p-4 backdrop-blur-sm dark:bg-darkBg-secondary" data-oid="c2fa45u">
                  <span className="mb-2 block text-xs text-lightFg-tertiary dark:text-darkFg-tertiary" data-oid="y80le6y">
                    📊 Pressão
                  </span>
                  <div className="text-lg font-semibold text-lightFg-primary dark:text-darkFg-primary" data-oid="5si0ejh">
                    {weatherData.main.pressure} hPa
                  </div>
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
