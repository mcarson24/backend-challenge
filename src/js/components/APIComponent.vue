<template>
  <div class="w-4/5 m-auto my-24 flex flex-col">
    <div class="flex mb-6">
      <div class="w-1/2 mx-4 px-4 flex flex-col justify-between">
        <h2 class="text-3xl text-center oswald">Single Snapshot</h2>
        <div class="py-2 flex justify-between">
          <flat-pickr v-model="at" 
                      :config="dateConfig" 
                      class="w-full px-2 py-2 bg-gray-300 rounded border border-gray-500" 
                      placeholder="Get snapshot at"
                      >
          </flat-pickr>
        </div>
        <div class="mt-3 flex flex-col">
          <station-select v-model="singleSnapshotStation" allow-all="true"></station-select>
          <button class="py-3 px-4 rounded bg-blue-700 shadow" 
                  :class="[!singleButtonSelectable ? 'text-gray-400 cursor-not-allowed' : 'text-white']"
                  @click="getDataAt" 
                  :disabled="!singleButtonSelectable">
                  Get
          </button>
        </div>
      </div>
      <div class="w-1/2 mx-4 px-4 flex flex-col justify-between">
        <h2 class="text-3xl text-center oswald">Snapshot Range</h2>
        <div>
          <div class="py-2 flex justify-between">
            <flat-pickr v-model="from" 
                        :config="dateConfig" 
                        class="w-full px-2 py-2 bg-gray-300 rounded border border-gray-500"
                        placeholder="Beginning of snapshot range"
                        >
            </flat-pickr>
          </div>
        </div>
        <div>
          <div class="py-2 flex justify-between">
            <flat-pickr v-model="to" 
                        :config="dateConfig"
                        class="w-full px-2 py-2 bg-gray-300 rounded border border-gray-500"
                        placeholder="End of snapshot range"
                        >
            </flat-pickr>
          </div>
        </div>
        <div class="mt-3 flex flex-col">
          <station-select :required="true" v-model="rangeStation"></station-select>
          <button class="py-3 px-4 rounded bg-blue-700 shadow" 
                  :class="[!rangeButtonSelectable ? 'text-gray-400 cursor-not-allowed' : 'text-white']"
                  @click="getRange" 
                  :disabled="!rangeButtonSelectable"
                  >
                  Get
          </button>
        </div>
      </div>
    </div>

    <div v-if="show" class="px-8">
      <div class="flex w-full items-center">
        <h2 v-if="type == 'range'" class="text-xl w-full text-center text-gray-800">
          There have been {{totalSnapshots}} snapshots taken for <a :href="fullDataLink" v-text="currentSnapshot" class="italic underline"></a> during that time period.
        </h2>
        <h2 v-else class="text-xl w-full text-center text-gray-800">
          The closest snapshot to that time was taken on {{date.day}} at {{date.time}}.
        </h2>
      </div>  
      <div v-if="type == 'data'" class="flex flex-col justify-around">
        <div class="mb-4 flex justify-center" v-if="weather !== '' && type == 'data'">
          <div class="flex flex-col items-center justify-center">
            <img :src="weatherIcon">
            <h3 class="text-5xl flex text-gray-900">{{ Math.round(weather.main.temp) }}&deg;</h3>
            <span v-text="weather.weather.description"></span>
          </div>
        </div>
        <div class="mb-4 flex justify-around">
          <div>
            <h3 class="text-3xl">Bikes Available</h3>
            <ul class="text-gray-800">
              <li :class="[!wantsSingleStation ? 'text-right' : 'text-center']">
                <span v-text="classicBikesAvailable" class="text-5xl text-gray-800"></span> classic
              </li>
              <li :class="[!wantsSingleStation ? 'text-right' : 'text-center']">
                <span v-text="electricBikesAvailable" class="text-5xl text-gray-800"></span> electric
              </li>
            </ul>
          </div>
          <div v-if="!wantsSingleStation">
            <h3 class="text-3xl">Station Status</h3>
            <ul>
              <li class="text-center">
                <span v-text="fullStations" class="text-5xl text-gray-800"></span> full
              </li>
              <li class="text-center">
                <span v-text="emptyStations" class="text-5xl text-gray-800"></span> empty
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="type == 'range'" 
           class="my-8 flex flex-row justify-around"
           >
        <div class="text-center">
          <h3 class="text-4xl text-gray-900"
              >
              {{averageTemperature}}&deg;
          </h3>
          <h4 class="text-lg text-gray-800">Avg Temp</h4>
        </div>
        <div class="text-center">
          <h3 v-text="(docksAvailable / snapshots.length).toFixed(0)" 
              class="text-4xl text-gray-900"
              >
          </h3>
          <h4 class="text-lg text-gray-800">Avg Docks Available</h4>
        </div>
        <div class="text-center">
          <h3 v-text="(bikesAvailable / snapshots.length).toFixed(0)" 
              class="text-4xl text-gray-900"
              >
          </h3>
          <h4 class="text-lg text-gray-800">Avg Bikes Available</h4>
        </div>
      </div>
      <div class="w-full text-right text-gray-800">
        <a :href="fullDataLink">View full JSON data</a>
      </div>
    </div>
  </div>  
</template>

<script>
  import '../../css/styles.css';
  import flatPickr from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';
  import moment from 'moment';
  import StationSelect from './StationSelect.vue';

  export default {
    components: { flatPickr, StationSelect },
    data() {
      return {
        from: '',
        to: '',
        at: '',
        show: false,
        type: '',
        message: '',
        date: {
          day: '',
          time: ''
        },
        currentSnapshot: '',
        totalSnapshots: 0,
        weatherMessage: '',
        snapshots: '',
        singleSnapshotStation: '',
        wantsSingleStation: false,
        averageTemperature: '',
        rangeStation: '',
        weather: '',
        docksAvailable: 0,
        bikesAvailable: 0,
        fullStations: 0,
        emptyStations: 0,
        fullDataLink: '',
        classicBikesAvailable: 0,
        electricBikesAvailable: 0,
        dateConfig: {
          enableTime: true,
          enableSeconds: true,
        }
      }
    },
    methods: {
      getRange() {
        if (!this.from || !this.to || !this.rangeStation) return;
        this.reset();
        this.show = true;
        this.type = 'range';
        fetch(`/api/v1/stations/${this.rangeStation}?from=${this.fromQueryString}&to=${this.toQueryString}`)
          .then(res => res.json())
          .then(res => {
            this.snapshots = res;
            this.totalSnapshots = res.length;
            this.currentSnapshot = res[0].station.properties.name;
            this.fullDataLink = `/api/v1/stations/${this.rangeStation}?from=${this.fromQueryString}&to=${this.toQueryString}${this.frequency ? '&frequency=daily' : ''}`;
            let temp = 0;
            res.map(snapshot => {
              temp += snapshot.weather.main.temp;
              this.bikesAvailable += snapshot.station.properties.bikesAvailable;
              this.docksAvailable += snapshot.station.properties.docksAvailable;
            });
            this.averageTemperature = (temp / this.totalSnapshots).toFixed(2);
          });
      },
      getDataAt() {
        if (!this.at) return;
        this.reset();
        this.show = true;
        this.type = 'data';
        if (this.singleSnapshotStation) {
          this.wantsSingleStation = true;
          this.fullDataLink = `/api/v1/stations/${this.singleSnapshotStation}?at=${this.atQueryString}`;
          fetch(`/api/v1/stations/${this.singleSnapshotStation}?at=${this.atQueryString}`)
            .then(res => res.json())
            .then(res => {
              this.snapshots = res;
              const date = this.reformatDate(res.at);
              this.date.day = this.getTime(date, 'dddd, MMMM Do YYYY');
              this.date.time = this.getTime(date, 'H:mm:ss a');
              this.weather = res.weather;
              this.electricBikesAvailable = parseInt(res.station.properties.electricBikesAvailable);
              this.classicBikesAvailable = parseInt(res.station.properties.classicBikesAvailable);
            })
        } else {
          this.fullDataLink = `/api/v1/stations?at=${this.atQueryString}`;
          this.wantsSingleStation = false;
          fetch(`/api/v1/stations?at=${this.atQueryString}`)
            .then(res => res.json())
            .then(({at, stations, weather}) => {
              const date = this.reformatDate(at);
              this.date.day = this.getTime(date, 'dddd, MMMM Do YYYY');
              this.date.time = this.getTime(date, 'H:mm:ss a');

              this.weather = weather;
              
              stations.map(({properties}) => {
                if (properties.docksAvailable == 0) this.fullStations++;
                if (properties.bikesAvailable == 0) this.emptyStations++;
                this.electricBikesAvailable += parseInt(properties.electricBikesAvailable);
                this.classicBikesAvailable += parseInt(properties.classicBikesAvailable);
              });
            });
        }
      },
      reformatDate(date) {
        const day = date.substr(0, 10);
        const time = date.substr(date.indexOf('T') + 1);

        return `${day}T${time}`;
      },
      reset() {
        this.bikesAvailable = this.docksAvailable = 0;
        this.classicBikesAvailable = this.electricBikesAvailable = this.fullStations = this.emptyStations = 0;
      },
      getTime(date, format = '') {
        const momentDate = moment(date);
        if (format.length) {
          return momentDate.format(format)
        }
        return momentDate;
      }
    },
    computed: {
      toQueryString() {
        return this.getTime(this.to, 'YYYY-MM-DDTHH:mm:ss');
      },
      fromQueryString() {
        return this.getTime(this.from, 'YYYY-MM-DDTHH:mm:ss');
      },
      atQueryString() {
        return this.getTime(this.at, 'YYYY-MM-DDTHH:mm:ss');
      },
      weatherIcon() {
				return `https://openweathermap.org/img/wn/${this.weather.weather[0].icon}@2x.png`
      },
      singleButtonSelectable() {
        return !!this.at;
      },
      rangeButtonSelectable() {
        return this.from && this.to && this.rangeStation;
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Lato&display=swap');

  flatpickr-input::placeholder,
  flatpickr-input::-ms-input-placeholder,
  flatpickr-input:-ms-input-placeholder {
    opacity: 100;
    color: pink;
  }
  body {
    @apply bg-gray-100;
  }
  .oswald {
    font-family: 'Lato', sans-serif;
  }
</style>
