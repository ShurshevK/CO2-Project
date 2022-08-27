<template>
  <div>
    <div class="header">


      <h1 class="title">
        <span v-html="t('co2Calculator')" />
        <div class="reload-btn">OBNOVIŤ</div>
      </h1>

      
       
      

      <h2 class="title">
         <img src="./assets/favicon.png">
        <span v-html="t('co2Calculator2')" />
      </h2>

      
        

      <div id="introduction">
        <span>
          Pomocou otázok týkajúcich sa 5 faktorov si môžeš rýchlo odhadnúť svoju dennú a ročnú
        uhlíkovú stopu
          v ekvivalente CO<sub>2</sub>
          <f class="COSub">(CO<sub>2</sub>e).
            <span class="tooltiptextCO2">merná jednotka, ktorá sa používa na štandardizáciu klimatických účinkov skleníkových plynov</span>
          </f>
        </span>
        <span class="description" v-if="hover">
          množstvo skleníkových plynov vyjadrené ako súčin hmotnosti v metrických tonách a ich
        potenciálu globálneho otepľovania
        </span>
      </div>
    </div>

    <div class="customOutputEl">
      <div class="customOutputElDesc">
        Každý deň vypustíš do ovzdušia {{ ((totalEmissions / 365) * 0.986).toFixed(2) }} litrov skleníkových plynov. Sleduj na balóne ako tvoja denná uhlíková stopa skutočne vyzerá a narastá.
        
      </div>
      <div class="customOutputValue" >
        {{ ((totalEmissions / 365)*0.986).toFixed(2) }} l CO<sub>2</sub>e/deň
      </div>
    </div>


    <div class="total">
      <el-progress :text-inside="true" :show-text="true" :stroke-width="70" :percentage="percentageOfReferenceEmissions"
        :color="colorGradient">
        <b> <span v-html="formatEmissions(totalEmissions) "> </span> </b>&nbsp;&nbsp;
      </el-progress>
    </div>

    <div id="questions">
      <div id="flying" class="topic">
        <p class="question">{{ t("flying.question") }}<intermediate-emission-display><span
              v-html="formatEmissions2(((flyingEmissions.estimatedEmissions * 1000)/ 365) * 0.986)" /></intermediate-emission-display>
        </p>
        <div class="options">
          <el-form :label-position="labelPosition" label-width="auto">
            <el-form-item :label="t('shortHauls')">
              <span class="tooltiptext">do 1500km</span>
              <el-input-number id="nShortHauls-option" v-model="flying.nShortHauls" :min="0" :label="t('shortHauls')">
              </el-input-number>
            </el-form-item>
            <el-form-item :label="t('mediumHauls')">
              <span class="tooltiptext">1500-4100km</span>
              <el-input-number id="nMediumHauls-option" v-model="flying.nMediumHauls" :min="0"
                :label="t('mediumHauls')"></el-input-number>
            </el-form-item>
            <el-form-item :label="t('longHauls')">
              <span class="tooltiptext">od 4100km</span>
              <el-input-number id="nLongHauls-option" v-model="flying.nLongHauls" :min="0" :label="t('mediumHauls')">
              </el-input-number>
            </el-form-item>
          </el-form>
        </div>


        <source-citation-list :sources="flyingEmissions.sources" />
      </div>

      <div id="driving" class="topic">
        <p class="question">{{ t("driving.question") }}<intermediate-emission-display>
            <span v-html="formatEmissions2(((drivingEmissions.estimatedEmissions * 1000)/ 365) * 0.986)" />
          </intermediate-emission-display>
        </p>


        <div class="options">
          <el-form :labelPosition="labelPosition" label-width="auto">
            <el-form-item :label="t('kilometersPerWeek')">
              <el-input-number v-model.number="driving.weeklyAverageDistance" id="driving-option" :min="0" :step="20"
                :label="t('kilometersPerWeek')"></el-input-number>
            </el-form-item>
          </el-form>
        </div>


        <source-citation-list :sources="drivingEmissions.sources" />
      </div>

      <div id="housing" class="topic">
        <p class="question">{{ t("housing.question") }} <intermediate-emission-display>
            <span v-html="formatEmissions2(((housingEmissions.estimatedEmissions * 1000)/ 365) * 0.986)" />
          </intermediate-emission-display>
        </p>
        <div class="options">
          <el-form :label-position="labelPosition" label-width="auto">
            <el-form-item :label="t('householdSize')">
              <el-input-number v-model.number="housing.householdSize" id="housing-household-size-option" :min="1"
                :label="t('householdSize')" />
            </el-form-item>
            <el-form-item :label="t('apartmentSize')">
              <el-input-number v-model.number="housing.apartmentSize" id="housing-apartment-size-option" :min="0"
                :step="10" :label="t('apartmentSize')" />
            </el-form-item>
            <el-form-item :label="t('apartmentAge')">
              <el-input-number v-model.number="housing.apartmentAge" id="housing-apartment-age-option" :min="1900"
                :max="2021" :step="10" :label="t('apartmentAge')" />
            </el-form-item>

            <el-form-item :label="t('housing.type')">
              <el-select v-model="housing.housing" id="housing-housing-option">
                <el-option v-for="item in housingOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('energySource')">
              <el-select v-model="heating.energySource">
                <el-option v-for="item in energySourceOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('greenEnergy')">
              <span class="tooltiptext">elektrina vyrobená z obnoviteľných zdrojov</span>
              <el-switch v-model="electricity.greenEnergy" id="electricity-green-energy-option2">
              </el-switch>
            </el-form-item>
          </el-form>
        </div>
        <source-citation-list :sources="housingEmissions.sources" />
      </div>

      <div id="nutrition" class="topic">
        <p class="question">{{ t("nutrition.question") }}<intermediate-emission-display>
            <span v-html="formatEmissions2(((nutritionEmissions.estimatedEmissions * 1000)/ 365) * 0.986)" />
          </intermediate-emission-display>
        </p>
        <div class="options">
          <el-form :label-position="labelPosition" label-width="auto">
            <el-form-item>
              <el-select v-model="nutrition.diet">
                <el-option v-for="item in nutritionOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>



        <source-citation-list :sources="nutritionEmissions.sources" />
      </div>

      <div id="consumerism" class="topic">
        <p class="question">{{ t("consumerism.question") }}<intermediate-emission-display>
            <span v-html="formatEmissions2(((consumerismEmissions.estimatedEmissions * 1000)/ 365) * 0.986)" />
          </intermediate-emission-display>
        </p>
        <div class="options">
          <el-form :label-position="labelPosition" label-width="auto">
            <el-form-item>
              <el-select v-model="consumerism.intensity">
                <el-option v-for="item in consumerismOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>


        <source-citation-list :sources="consumerismEmissions.sources" />
      </div>
    </div>
    <div id="result">
      <div id="summary" v-html="t('result', { totalEmissions: formatEmissions(totalEmissions), relationToAverage })">
      </div>
    </div>

    <div class="header bottom-header">
      <h3 class="title">
        <span v-html="t('how')" />
      </h3>

      <h4 class="title">
        <span v-html="t('compensate')" />
      </h4>
    </div>
  </div>




</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useI18n } from "vue-i18n"

import _ from "lodash"

import { EstimationResponse, Units } from "./lib/estimation"
// import * as base from "./estimation/base"
import * as flying from "./lib/estimation/flying"
import * as nutrition from "./lib/estimation/nutrition"
import * as driving from "./lib/estimation/driving"
import * as electricity from "./lib/estimation/electricity"
import * as heating from "./lib/estimation/heating"
import * as consumerism from "./lib/estimation/consumerism"

import SourceCitationList from "./components/SourceCitationList.vue"
import IntermediateEmissionDisplay from "./components/IntermediateEmissionDisplay.vue"

import firebase from "./firebaseInit"
const db = firebase.ref("/emission-data")

export default defineComponent({
  name: "App",
  setup() {
    const { t, n, locale } = useI18n({
      inheritLocale: true,
      useScope: "global",
      numberFormats: {
        en: {
          co2e: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        },
        de: {
          co2e: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        },
      },
    })

    const localeFromPath = window.location.pathname.replace("/", "")
    if (localeFromPath) {
      locale.value = localeFromPath
    }
    return { t, n, locale }
  },
  mounted() {
    this.windowWidth = window.innerWidth
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth
    })
  },
  data() {
    return {
      windowWidth: 0,
      energySourceOptions: this.i18nOptions([
        "housing.options.oil",
        "housing.options.naturalGas",
        "housing.options.electricity",
        "housing.options.LPG",
        "housing.options.solidFuels",
      ]),

      housingOptions: this.i18nOptions(["housing.options.house", "housing.options.apartment"]),
      consumerismOptions: this.i18nOptions([
        "consumerism.options.frugal",
        "consumerism.options.normal",
        "consumerism.options.lush",
        "consumerism.options.none",
      ]),
      nutritionOptions: this.i18nOptions([
        "nutrition.options.CARNIVORE",
        "nutrition.options.FLEXITARIAN",
        "nutrition.options.VEGETARIAN",
        "nutrition.options.VEGAN",
        "nutrition.options.none",
      ]),
      flying: {
        nShortHauls: 0,
        nMediumHauls: 0,
        nLongHauls: 0,
      },
      nutrition: {
        diet: "none",
      },
      driving: {
        weeklyAverageDistance: 0,
      },
      housing: {
        householdSize: 1,
        apartmentSize: 0,
        apartmentAge: 2020,
        housing: "apartment",
        greenEnergy: "electricity-green-energy-option2",
      },
      heating: {
        energySource: "electricity",
      } as heating.HeatingEstimationParams,
      electricity: {
        greenEnergy: true,
      } as electricity.ElectricityEstimationParams,
      consumerism: {
        country: "Germany",
        intensity: "none",
      } as consumerism.ConsumerismEstimationParams,
      referenceEmissions: 15_000,
      referenceAverageEmissions: 7_700,

      // Styling.
      colorGradient: [
        "#fcd43f",
        "#fccf3f",
        "#fccc3f",
        "#fcc83f",
        "#fcc33f",
        "#fcbc3f",
        "#fcb83f",
        "#fcb23f",
        "#fcad3f",
        "#fca53f",
        "#fc9f3f",
        "#fc993f",
        "#fc953f",
        "#fc8f3f",
        "#fc8b3f",
        "#fc873f",
        "#fc823f",
        "#fc7b3f",
        "#fc733f",
        "#fc6b3f",
        "#fc623f",
        "#fc5b3f",
      ],
    }
  },
  computed: {
    totalEmissions(): number {
      return _.sum([
        this.flyingEmissions.estimatedEmissions,
        this.nutritionEmissions.estimatedEmissions,
        this.drivingEmissions.estimatedEmissions,
        this.heatingEmissions.estimatedEmissions,
        this.electricityEmissions.estimatedEmissions,
        this.consumerismEmissions.estimatedEmissions,
      ])
    },
    flyingEmissions(): EstimationResponse {
      return flying.estimateEmissions(this.flying)
    },
    nutritionEmissions(): EstimationResponse {
      return nutrition.estimateEmissions(this.nutrition)
    },
    drivingEmissions(): EstimationResponse {
      return driving.estimateEmissions(this.driving)
    },
    heatingEmissions(): EstimationResponse {
      return heating.estimateEmissions({ ...this.housing, ...this.heating })
    },
    electricityEmissions(): EstimationResponse {
      return electricity.estimateEmissions({ ...this.housing, ...this.electricity })
    },
    housingEmissions(): EstimationResponse {
      return {
        estimatedEmissions:
          this.heatingEmissions.estimatedEmissions + this.electricityEmissions.estimatedEmissions,
        unit: Units.KG_CO2E_PER_YEAR,
        sources: this.heatingEmissions.sources.concat(this.electricityEmissions.sources),
      }
    },
    consumerismEmissions(): EstimationResponse {
      return consumerism.estimateEmissions(this.consumerism)
    },
    percentageOfReferenceEmissions(): number {
      return _.clamp((this.totalEmissions / this.referenceEmissions) * 100, 0, 100)
    },
    percentageOfReferenceAverageEmissions(): number {
      return (this.totalEmissions / this.referenceAverageEmissions) * 100
    },
    relationToAverage(): string {
      if (this.percentageOfReferenceAverageEmissions < 65) {
        return this.t("relation.farBelow")
      } else if (this.percentageOfReferenceAverageEmissions < 100) {
        return this.t("relation.below")
      } else if (
        this.percentageOfReferenceAverageEmissions >= 100 &&
        this.percentageOfReferenceAverageEmissions < 150
      ) {
        return this.t("relation.above")
      } else {
        return this.t("relation.farAbove")
      }
    },
    labelPosition(): string {
      return this.windowWidth > 800 ? "right" : "top"
    },
  },
  methods: {
    formatEmissions(emissions) {
      return `${this.n(emissions / 1000, "co2e")} ${this.t("tonsCarbon")}`
    },
    i18nOptions(options) {
      return options.map(opt => ({ value: opt.split(".").pop(), label: this.t(opt) }))
    },
    formatEmissions2(emissions) {
      return `${this.n(emissions / 1000, "co2e")} ${this.t("litresCarbon")}`
      },
  },
  watch: {
    totalEmissions: async function (newVal, oldVal) {
      console.log("totalEmissions change", newVal)
      db.set({ "emission-count": newVal })
    },
  },
  components: {
    SourceCitationList,
    IntermediateEmissionDisplay,
  },
})
</script>

<style lang="scss">
$font-size-1: 2em;
$font-size-2: 1.2em;
$font-size-3: 1.1em;
$font-size-4: 0.7em;
$font-size-5: 3em;
$color: #2c3e50;
$background-color: #000000;
$font-color: #000000;
$planted-lime: #d2ff68;
$planted-green: #d2ff68;
$planted-pink: #f091ff;



@mixin center {
  margin: auto;
  width: 75%;
}

@mixin text-block {
  text-align: justify;
  font-size: $font-size-2;
  margin: 1% auto;
}

html {
  box-sizing: border-box;
}

* {
  box-sizing: inherit;
}

*:before {
  box-sizing: inherit;
}

*:after {
  box-sizing: inherit;
}

@font-face {
  font-family: "PPNeueMontreal-Medium";
  src: local("PPNeueMontreal-Medium"),
    url(./fonts/PPNeueMontreal-Medium.otf) format("truetype");
}

@font-face {
  font-family: "PPNeueMontreal-Regular";
  src: local("PPNeueMontreal-regular"),
    url(./fonts/PPNeueMontreal-Regular.otf) format("truetype");
}


@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,500;0,600;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@200;300;400;500;600;700&display=swap');

body {
  margin-top: 0;
  background-color: $background-color;
  font-family: "Noto Sans Mono", monospace;
}

a {
  color: #3d3d3d;
  text-decoration: none;
}

b {
  font-weight: 400;
}

#app {
  font-family: "Noto Sans Mono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $font-color;
  margin: 10px;
}

@media screen and (min-width: 1100px) {
  #app {
    width: 1300px;
    margin: 7px auto;
  }
}

@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.title {
  div {
    display: inline;
  }
}

.header {
  h1 {
    font-family: "PPNeueMontreal-Regular";
    font-size: 140px;
    letter-spacing: 7px;
    color: #000000;
    text-align: left;
    margin-left: -6%;
    margin-top: 2%;
    margin-bottom: 0%;
    width: fit-content;
    padding: 0 10px;
  }

  h2 {
    font-family: "PPNeueMontreal-Regular";
    font-size: 140px;
    letter-spacing: 7px;
    color: #000000;
    text-align: left;
    margin-left: 22%;
    margin-top: -2%;
    margin-bottom: 4%;
    width: fit-content;
    padding: 0 10px;
  }

  h3 {
    font-family: "PPNeueMontreal-Regular";
    font-size: 140px;
    letter-spacing: 7px;
    color: #000000;
    text-align: left;
    margin-left: 70%;
    margin-top: -7%;
    margin-bottom: 2%;
    width: fit-content;
    padding: 0 10px;
  }

  h4 {
    font-family: "PPNeueMontreal-Regular";
    font-size: 140px;
    letter-spacing: 7px;
    color: #000000;
    text-align: left;
    margin-left: -5%;
    margin-top: -3%;
    margin-bottom: 0%;
    width: fit-content;
    padding: 0 10px;
  }

  img {
    display: inline;
    height: 4ex;
    vertical-align: middle;
  }

  text-align: center;
  padding-left: 5%;
  padding-right: 5%;
  padding-top: 2%;
  padding-bottom: 0;

  background-color: $background-color;

  // top left corner should start at topmost spot
  top: 0;

  // take up the full browser width
  width: 100%;
}

.description {
  font-weight: 100;
  padding-left: 5%;
  font-size: 0.7em;
}

.question {
  font-family: "PPNeueMontreal-Medium";
  font-size: 30px;
  text-align: left;
  margin-top: 2%;
  margin-bottom: 2%;
  margin-left: 2%;
  color: $font-color;
  background: #ffffff00;


}

.header img {
    display: inline;
    height: 3ex;
    margin-left: -19rem;
    margin-right: 4rem;
    margin-top: -1rem;
}


// CO2 Styles

.tooltiptextCO2 {
  visibility: hidden;
  width: 500px;
  height: 5px;
  font-size: $font-size-4;
  color: #000000;
  text-align: left;
  border-radius: 6px;
  padding: 5px 0;
  line-height: 20px;

  /* Position the tooltip */
  position: absolute;
  left: 2;
}

.COSub:hover .tooltiptextCO2 {
  visibility: visible;
  -webkit-animation: fadeIn 1s;
  animation: fadeIn 1s;
}

.tooltiptextC {
  visibility: hidden;
  width: 500px;
  height: 10px;
  font-size: $font-size-4;
  color: #000000;
  text-align: left;
  padding: 5px 0;
  line-height: 15px;

  /* Position the tooltip */
  position: absolute;
  left: 2;
}

.COSub:hover .tooltiptextC {
  visibility: visible;
  -webkit-animation: fadeIn 1s;
  animation: fadeIn 1s;
}

// Holes Sytles
.tooltiptext {
  visibility: hidden;
  width: 150px;
  color: #000000;
  text-align: left;
  border-radius: 6px;
  padding: 5px 0;
  line-height: 15px;

  /* Position the tooltip */
  position: absolute;
  left: 0;
}

.tooltiptext::after {
  visibility: hidden;
  width: 120px;
  background-color: rgb(82, 72, 72) transparent transparent transparent;
  color: #fff;

  border-radius: 6px;
  padding: 5px 0;

  /* Position the tooltip */
  position: absolute;
  left: 0;
}

.el-form-item__label-wrap:hover~.el-form-item__content>.tooltiptext {
  visibility: visible;
  -webkit-animation: fadeIn 1s;
  animation: fadeIn 1s;
}

.total {
  background-color: $background-color;
  padding-top: 2%;
  padding-bottom: 4%;

  position: sticky;
  // take up the full browser width
  width: 100%;

  // high z index so other content scrolls underneath
  z-index: 200;
  top: 0;
}

.options {
  @include center;
  text-align: left;
  padding-left: 0;
  position: relative;
}

#introduction {
  @include text-block;
  text-align: left;
  margin-left: 23%;
  margin-top: -2%;
}

#result {
  @include text-block;
  text-align: left;
  margin-left: 2%;
  margin-top: 4%;
  width: 700px;
}

.emissions[data-v-611d6802] {
  width: 30%;
}
</style>
