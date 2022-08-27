import co2eq from "@tmrow/bloom-contrib/co2eq"
import * as bloomDefinitions from "@tmrow/bloom-contrib/definitions"

import {EstimationResponse, Units} from ".."
import * as t from "io-ts"
import {Estimate, ValidUntilSource} from "../sources"

enum Countries {
  GERMANY = "Germany",
}

const CountriesType: {
  [key: string]: null
} = Object.values(Countries).reduce((acc, x) => Object.assign(acc, {[x]: null}), {})

export const ConsumerismEstimationParams = t.type({
  country: t.readonly(t.keyof(CountriesType)),
  intensity: t.readonly(
    t.keyof({
      frugal: null,
      normal: null,
      lush: null,
      none: null,
    }),
  ),
})

export type ConsumerismEstimationParams = t.TypeOf<typeof ConsumerismEstimationParams>

const energyConsumptionForProductsInGermany = Estimate.of(
  new ValidUntilSource(
    72,
    "https://www.enviroportal.sk/indicator/detail?id=2621",
    {
      en: {title: "Energy consumption for other products in Germany in (petajoule)"},
      de: {title: "Celková spotreba energie pre obchod na Slovensku za rok 2020 (PJ)"},
    },
    new Date("2022-01-24"),
  ),
)

const energyConsumptionForServiceInGermany = Estimate.of(
  new ValidUntilSource(
    72,
    "https://www.enviroportal.sk/indicator/detail?id=2621",
    {
      en: {title: "Energy consumption for other services in Germany (petajoule)"},
      de: {
        title: "Celková spotreba energie pre služby na Slovensku za rok 2020 (PJ)",
      },
    },
    new Date("2022-01-24"),
  ),
)

const energyConsumptionForConsumerismInGermany = Estimate.of(
  new ValidUntilSource(
    622,
    "https://ourworldindata.org/energy/country/slovakia",
    {
      en: {title: "Total energy consumption in Germany (petajoule)"},
      de: {title: "Celková spotreba energie na Slovensku za rok 2020 (PJ)"},
    },
    new Date("2022-01-24"),
  ),
)

const carbonEmissionsForConsumerismInGermany = Estimate.of(
  new ValidUntilSource(
    30e6,
    "https://ourworldindata.org/co2/country/slovakia?country=~SVK",
    {
      en: {title: "Carbon emissions for consumerism in Germany (tons)"},
      de: {title: "Ročné emisie CO2 pre spotrebu na Slovensku za rok 2020 (v tonách)"},
    },
    new Date("2022-01-24"),
  ),
)

const populationGermany = Estimate.of(
  new ValidUntilSource(
    5_449_270,
    "https://www.scitanie.sk/",
    {
      en: {title: "German total population 2016"},
      de: {title: "Celkový počet obyvateľov Slovenska"},
    },
    new Date("2022-01-24"),
  ),
)

const intensityFactors = Estimate.of(
  new ValidUntilSource(
    {
      frugal: 1 - 0.341,
      normal: 1,
      lush: 1 + 0.341,
      none: 0,
    },
    "https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule",
    {
      en: {title: "Factors of consumerism"},
      de: {title: "Faktory konzumu vypočítané podľa pravidla troch sigma = 3σ "},
    },
    new Date("2022-01-24"),
  ),
)

export const estimateEmissions = (req: ConsumerismEstimationParams): EstimationResponse => {
  const estimatedEmissions = Estimate.combine(
    energyConsumptionForConsumerismInGermany,
    energyConsumptionForProductsInGermany,
    energyConsumptionForServiceInGermany,
    carbonEmissionsForConsumerismInGermany,
    populationGermany,
    intensityFactors,
  )(
    (
      energyConsumptionForConsumerism,
      energyConsumptionForProducts,
      energyConsumptionForServices,
      carbonEmissionsForConsumerism,
      population,
      intensityFactors,
    ) => {
      const proportionOfPrivateConsumerism =
        (energyConsumptionForProducts + energyConsumptionForServices) /
        energyConsumptionForConsumerism
      const carbonEmissionsOfPrivateConsumerism =
        carbonEmissionsForConsumerism * proportionOfPrivateConsumerism

      return (
        (carbonEmissionsOfPrivateConsumerism / population) * 1000 * intensityFactors[req.intensity]
      )
    },
  )

  return {
    estimatedEmissions: estimatedEmissions.value,
    unit: Units.KG_CO2E_PER_YEAR,
    sources: estimatedEmissions.exportSources(),
  }
}
