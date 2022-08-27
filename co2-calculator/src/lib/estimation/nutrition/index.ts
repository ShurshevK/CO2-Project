import co2eq from "@tmrow/bloom-contrib/co2eq"
import * as bloomDefinitions from "@tmrow/bloom-contrib/definitions"

import {Estimate, ValidUntilSource} from "../sources"
import {EstimationResponse, Units} from ".."
import * as t from "io-ts"

const [
  ingredientsCarbonModel,
  mealCarbonModel,
  carCarbonModel,
  flightCarbonModel,
  transportationCarbonModel,
  energyCarbonModel,
  hotelCarbonModel,
  purchaseCarbonModel,
  electricityWorldAverageCarbonModel,
] = co2eq

enum Diet {
  none = "none",
  VEGAN = "VEGAN",
  VEGETARIAN = "VEGETARIAN",
  FLEXITARIAN = "FLEXITARIAN",
  CARNIVORE = "CARNIVORE",
}

const DietType: {
  [key: string]: null
} = Object.values(Diet).reduce((acc, x) => Object.assign(acc, {[x]: null}), {})

export const NutritionEstimationParams = t.type({
  diet: t.readonly(t.keyof(DietType)),
})

export type NutritionEstimationParams = t.TypeOf<typeof NutritionEstimationParams>

const dietToMealType = (diet: Diet): string => {
  switch (diet) {
    case Diet.VEGAN:
      return bloomDefinitions.MEAL_TYPE_VEGAN
    case Diet.VEGETARIAN:
      return bloomDefinitions.MEAL_TYPE_VEGETARIAN
    case Diet.FLEXITARIAN:
      return bloomDefinitions.MEAL_TYPE_MEAT_LOW
    case Diet.CARNIVORE:
      return bloomDefinitions.MEAL_TYPE_MEAT_HIGH
    default:
      return "none"
  }
}

const dietImpacts = new ValidUntilSource(
  "Všežravá diéta = 4 kg/CO2e/d, ovo-laktovegetariánska = 2,8 kg/CO2e/d, vegánska strava = 2,3 kg/CO2e/d",

  "https://www.nature.com/articles/s41598-017-06466-8 ",
  
  {
    en: {title: "Environmental impact of omnivorous, ovo-lacto-vegetarian, and vegan diet"},
    de: {
      title: "Vegánske stravovanie: vylučuje produkty a bielkoviny živočíšneho pôvodu  .  Vegetariánske stravovanie: bezmäsitá strava  .  Málo mäsa: prevažne vegetariánske stravovanie a príležitostne mäso  .  Veľa mäsa: prevažne mäsitá strava  .  ",
    },
  },
  new Date("2021/12/25"),
)





export const estimateEmissions = (req: NutritionEstimationParams): EstimationResponse => {
  const mealType = dietToMealType(req.diet as Diet)
  if (mealType === "none") {
    console.log("estimateEmissions", "none")
    return {estimatedEmissions: 0, unit: Units.KG_CO2E_PER_YEAR, sources: [dietImpacts.toJson()]}
  }
  const estimatedEmissions = Math.round(
    mealCarbonModel.carbonEmissions({mealType, numberOfMeals: 365 * 3}),
  )

  return {estimatedEmissions, unit: Units.KG_CO2E_PER_YEAR, sources: [dietImpacts.toJson()]}
}
