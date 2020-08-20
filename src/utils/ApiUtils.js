
export async function getWeather() {
  const coords = await getCoords();
  console.log(coords);
  const weather = await getWeatherFromCoords(coords);
  return weather;
}

async function getCoords() {
  try {
    const url = 'https://ipgeolocation.com/?json=1';
    const res = await fetch(url);
    const data = await res.json();
    const rawCoords = data.coords.split(',');
    return {
      lat: rawCoords[0],
      lon: rawCoords[1]
    };
  } catch(err) {
    console.error(err);
  }
}

async function getWeatherFromCoords(coords) {
  try {
    const url = 'https://fcc-weather-api.glitch.me/api/current?'
      + `lat=${coords.lat}&lon=${coords.lon}`;
    console.log(url);
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    return data.weather[0].main;
  } catch(err) {
    console.error(err);
    return 'Not working...';
  }
}

export async function getFlagUrl() {
  const countryName = await getCountryName();
  const flagUrl = await getFlagUrlFromCountryName(countryName, 'automatic');
  if (flagUrl) return flagUrl;
  else return 'https://restcountries.eu/data/ata.svg';
}

async function getCountryName() {
  try {
    const url = 'https://ipgeolocation.com/?json=1';
    const res = await fetch(url);
    const data = await res.json();
    const countryName = data.country;
    return countryName;
  } catch(err) {
    console.error(err);
    return 'Antarctica';
  }
}

export async function getFlagUrlFromCountryName(countryName, mode) {
  try {
    const url = `https://restcountries.eu/rest/v2/name/${countryName}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    else if (data.length === 1) return data[0].flag;
    else if (mode === 'interactive') {
      const options = data.map((country, index) =>
        `\n${index + 1}: ${country.name}`);
      const choice = parseInt(prompt(
        'What country do you mean?\n' +
        options +
        '\n\nEnter the number of your choice:'));
      if (
        isNaN(choice) ||
        !Number.isInteger(choice) ||
        choice < 1 ||
        choice > data.length
      ) return null;
      return data[choice-1].flag;
    } else {
      const options = data.map(country => country.name.length);
      const choice = options.indexOf(Math.min(...options));
      return data[choice].flag;
    }
  } catch(err) {
    console.error(err);
    return null;
  }
}

export async function getFlagUrlFromCountryCode(countryCode) {
  try {
    const url = `https://restcountries.eu/rest/v2/alpha/${countryCode}`;
    const res = await fetch(url);
    if (!res.ok) return getFlagUrlFromCountryName(countryCode, 'interactive');
    const data = await res.json();
    return data.flag;
  } catch(err) {
    console.error(err);
    return null;
  }
}
