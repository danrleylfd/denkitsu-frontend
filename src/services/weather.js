import api from "./"

const getWeatherByLocation = async (location) => {
  try {
    const { data } = await api.get(`/weather/location/${location}`)
    return data
  } catch (error) {
    console.error(`Error on getWeatherByLocation ${location}:`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const { data } = await api.get(`/weather/coordinates/${lat}/${lon}`)
    return data
  } catch (error) {
    console.error(`Error on getWeatherByCoordinates (${lat}, ${lon}):`, error.response?.data?.error?.message || error.message)
    throw error
  }
}

export { getWeatherByLocation, getWeatherByCoordinates }
