import React, { useContext } from 'react';

import { UserContext } from '../context';

import { changeFlag } from '../firebase';

import {
  getFlagUrlFromCountryName,
  getFlagUrlFromCountryCode
} from '../utils/ApiUtils';

function UserName({gameId, user}) {
  const uid = useContext(UserContext);

  async function handleFlagClick() {
    if (uid !== user.userId) return;
    const country = prompt('Enter a 2/3-letter country code'
      + ' or the full name of the country whose flag you want to show.');
    if (!country || country.length <= 1) return;
    const flagUrl = (country.length <= 3) ? (
      await getFlagUrlFromCountryCode(country)
    ) : (
      await getFlagUrlFromCountryName(country, 'interactive')
    )
    if (flagUrl) changeFlag(gameId, user.userId, flagUrl);
    else alert('Country not found...')
  }

  return (
    <h3>
      <img
        className='flag'
        src={user.flag}
        alt='flag'
        onClick={handleFlagClick}
      />
      &nbsp;
      {user.name}
    </h3>
  )
}

export default UserName;
