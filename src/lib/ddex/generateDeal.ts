export function generateDeal(dealList: any, release: any) {

  const releaseDeal = dealList.ele("ReleaseDeal")

  releaseDeal
    .ele("DealReleaseReference")
    .txt("R1")

  const deal = releaseDeal.ele("Deal")

  const dealTerms = deal.ele("DealTerms")

  /*
  TERRITORY MAP
  */

  const territoryRegions: Record<string, string[]> = {

    EUROPE: [
      "ES","FR","DE","IT","NL","BE","PT","SE","NO","FI",
      "DK","IE","PL","AT","CH","CZ","HU","RO","BG","GR"
    ],

    LATAM: [
      "MX","AR","CO","CL","PE","EC","UY","PY","BO","VE",
      "CR","PA","GT","HN","NI","SV","DO"
    ],

    NORTH_AMERICA: [
      "US","CA"
    ],

    ASIA: [
      "JP","KR","CN","IN","SG","TH","MY","ID","PH"
    ],

    AFRICA: [
      "ZA","NG","EG","KE","MA","GH","TZ","UG","SN"
    ],

    OCEANIA: [
      "AU","NZ"
    ]

  }

  /*
  TERRITORIES
  */

  let territories = new Set<string>()

  if (release.distributionWorldwide) {

    territories.add("Worldwide")

  } else if (release.distributionTerritories?.length) {

    release.distributionTerritories.forEach((territory: string) => {

      const region = territoryRegions[territory]

      if (region) {

        region.forEach(country => territories.add(country))

      } else {

        territories.add(territory)

      }

    })

  } else {

    territories.add("Worldwide")

  }

  /*
  WRITE TERRITORIES
  */

  territories.forEach((territory) => {

    dealTerms
      .ele("TerritoryCode")
      .txt(territory)

  })

  /*
  VALIDITY PERIOD
  */

  const validity = dealTerms.ele("ValidityPeriod")

  const date = release.releaseDate
    ? new Date(release.releaseDate)
    : new Date()

  validity
    .ele("StartDate")
    .txt(date.toISOString().split("T")[0])

  /*
  COMMERCIAL MODEL
  */

  dealTerms
    .ele("CommercialModelType")
    .txt("SubscriptionModel")

  /*
  USE TYPES
  */

  dealTerms
    .ele("UseType")
    .txt("OnDemandStream")

  dealTerms
    .ele("UseType")
    .txt("PermanentDownload")

}