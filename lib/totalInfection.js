import {limitedInfection} from './limitedInfection';

export function totalInfection({user, siteVersion}) {
  return limitedInfection({
    user,
    numToInfect: Infinity,
    siteVersion
  });
};